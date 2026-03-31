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
        const { tableId, items, cashierName } = req.body;
        const order = new Order({
            tableId,
            items,
            cashierName,
            totalAmount: items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        });
        await order.save();

        // Update table to Occupied
        await Table.findByIdAndUpdate(tableId, {
            status: 'Occupied',
            currentOrder: order._id
        });

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
        const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const order = await Order.findByIdAndUpdate(id, { items, totalAmount }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.closeOrderAndBill = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndUpdate(id, { isPaid: true }, { new: true });

        // Free up the table
        await Table.findOneAndUpdate({ currentOrder: id }, {
            status: 'Available',
            currentOrder: null
        });

        res.json({ message: 'Bill cleared and table freed', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
