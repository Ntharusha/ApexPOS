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
