const { Table, Product, Category, Order } = require('../models/AllModels');
const { v4: uuidv4 } = require('uuid'); // Will use crypto if uuid not available, let's just make a simple ID generator for now.

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Get menu for customers
exports.getTableMenu = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        const categories = await Category.find();
        res.status(200).json({ products, categories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Start or retrieve a session for a table
exports.startTableSession = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await Table.findById(tableId);
        if (!table) return res.status(404).json({ message: 'Table not found' });

        if (!table.activeSessionId || table.status === 'Available') {
            table.activeSessionId = generateSessionId();
            table.status = 'Occupied';
            await table.save();
            
            // Notify POS that table is now occupied
            req.app.get('io').emit('table_status_changed', table);
        }

        res.status(200).json({ table, sessionId: table.activeSessionId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Customer places an order via QR
exports.placeOrder = async (req, res) => {
    try {
        const { tableId, sessionId, items, totalAmount } = req.body;
        const table = await Table.findById(tableId);
        
        if (!table) return res.status(404).json({ message: 'Table not found' });
        if (table.activeSessionId !== sessionId) {
            return res.status(403).json({ message: 'Invalid session for this table. Please scan the QR code again.' });
        }

        // Check if there is an open order for this table
        let order = await Order.findOne({ tableId, status: { $in: ['Pending', 'Preparing'] } });

        if (order) {
            // Append items to existing order
            order.items.push(...items.map(item => ({ ...item, status: 'Pending' })));
            order.totalAmount += totalAmount;
            await order.save();
        } else {
            // Create new order
            order = new Order({
                tableId,
                orderType: 'QR-Order',
                status: 'Pending',
                items: items.map(item => ({ ...item, status: 'Pending' })),
                totalAmount,
                customerSessionId: sessionId
            });
            await order.save();
            table.currentOrder = order._id;
            await table.save();
        }

        // Broadcast to KDS and Main POS
        req.app.get('io').emit('new_kds_order', order);

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all active orders for KDS
exports.getKDSOrders = async (req, res) => {
    try {
        const orders = await Order.find({ orderType: { $in: ['QR-Order', 'Dine-In'] }, status: { $in: ['Pending', 'Preparing', 'Ready'] } })
            .populate('tableId', 'tableNumber')
            .sort({ createdAt: 1 });
            
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update order / item status from KDS
exports.updateKDSStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, itemId, itemStatus } = req.body;
        
        const order = await Order.findById(orderId).populate('tableId', 'tableNumber');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (itemId && itemStatus) {
            // Update specific item status
            const item = order.items.id(itemId);
            if (item) item.status = itemStatus;
            
            // Check if all items are ready
            const allReady = order.items.every(i => i.status === 'Ready' || i.status === 'Served' || i.status === 'Cancelled');
            if (allReady) order.status = 'Ready';
            
        } else if (status) {
            // Update whole order status
            order.status = status;
            if (status === 'Ready') {
                order.items.forEach(i => i.status = 'Ready');
            }
        }

        await order.save();

        // Broadcast update to KDS and customer phone and POS
        req.app.get('io').emit('kds_order_updated', order);
        
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
