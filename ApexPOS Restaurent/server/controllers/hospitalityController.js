const { Table, Order, Product } = require('../models/AllModels');

// --- Tables ---
exports.getTables = async (req, res) => {
    try {
        const tables = await Table.find().populate('currentOrder');
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.status(201).json(table);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const table = await Table.findByIdAndUpdate(id, { status }, { new: true });
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Orders / KOT ---
exports.createOrder = async (req, res) => {
    try {
        const { tableId, items, cashierName, orderType = 'Dine-In' } = req.body;
        
        // 1. Check table status
        const table = await Table.findById(tableId);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        
        // 2. Create Order record
        const order = new Order({
            tableId,
            orderType,
            items,
            cashierName,
            totalAmount: items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        });
        await order.save();

        // 3. Update table to Occupied and link order
        table.status = 'Occupied';
        table.currentOrder = order._id;
        await table.save();

        // 4. Broadcast to KDS and POS
        const io = req.app.get('io');
        if (io) {
            io.emit('new_kds_order', order);
            io.emit('table_status_changed', table);
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        
        const order = await Order.findById(id);
        if(!order) return res.status(404).json({ message: 'Order not found' });

        order.items = items;
        order.totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        await order.save();

        // Broadcast update
        const io = req.app.get('io');
        if (io) {
            io.emit('kds_order_updated', order);
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.closeOrderAndBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { payments } = req.body; // Expect payment details from POS

        const order = await Order.findById(id).populate('tableId');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // 1. Mark order as completed
        order.isPaid = true;
        order.status = 'Completed';
        await order.save();

        // 2. Free up the table
        const table = await Table.findById(order.tableId._id);
        if (table) {
            table.status = 'Available';
            table.currentOrder = null;
            table.activeSessionId = null; 
            await table.save();
        }

        // 3. Broadcast updates
        const io = req.app.get('io');
        if (io) {
            io.emit('table_status_changed', table);
            io.emit('dashboardUpdate');
        }

        res.json({ message: 'Bill cleared and table freed', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
