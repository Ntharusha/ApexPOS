const { Staff, Customer, Supplier } = require('../models/AllModels');

// ============ STAFF ============
exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createStaff = async (req, res) => {
    const staff = new Staff(req.body);
    try {
        const newStaff = await staff.save();
        res.status(201).json(newStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndUpdate(id, req.body, { new: true });
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await Staff.findByIdAndDelete(id);
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============ CUSTOMERS ============
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    const customer = new Customer(req.body);
    try {
        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await Customer.findByIdAndDelete(id);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomerRecommendations = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        const { Sale } = require('../models/AllModels');

        const recommendations = await Sale.aggregate([
            { $match: { customerId: new mongoose.Types.ObjectId(id) } },
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                name: { $first: "$items.name" },
                price: { $first: "$items.price" },
                count: { $sum: 1 },
                totalQty: { $sum: "$items.quantity" },
                lastOrdered: { $max: "$date" }
            }},
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomerStats = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        const { Sale } = require('../models/AllModels');

        const stats = await Sale.aggregate([
            { $match: { customerId: new mongoose.Types.ObjectId(id) } },
            { $group: {
                _id: null,
                totalSpend: { $sum: "$grandTotal" },
                visitCount: { $sum: 1 },
                avgOrderValue: { $avg: "$grandTotal" },
                lastVisit: { $max: "$date" },
                firstVisit: { $min: "$date" }
            }}
        ]);

        const result = stats[0] || {
            totalSpend: 0,
            visitCount: 0,
            avgOrderValue: 0,
            lastVisit: null,
            firstVisit: null
        };

        // Calculate loyalty tier
        let tier = 'New';
        if (result.visitCount >= 50 || result.totalSpend >= 500000) tier = 'Platinum';
        else if (result.visitCount >= 20 || result.totalSpend >= 200000) tier = 'Gold';
        else if (result.visitCount >= 10 || result.totalSpend >= 100000) tier = 'Silver';
        else if (result.visitCount >= 3) tier = 'Bronze';

        // Get recent orders (last 5)
        const recentOrders = await Sale.find({ customerId: new mongoose.Types.ObjectId(id) })
            .sort({ date: -1 })
            .limit(5)
            .select('date grandTotal items.name items.quantity');

        res.json({ ...result, tier, recentOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============ SUPPLIERS ============
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSupplier = async (req, res) => {
    const supplier = new Supplier(req.body);
    try {
        const newSupplier = await supplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await Supplier.findByIdAndDelete(id);
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
