const { Sale, Expense, Staff, Repair, Supplier, Delivery, Customer } = require('../models/AllModels');
const Product = require('../models/Product');

// existing ones kept for compatibility
exports.getProfitLoss = async (req, res) => {
    try {
        const sales = await Sale.find();
        const expenses = await Expense.find();
        const totalSales = sales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const profit = totalSales - totalExpenses;
        res.json({ totalSales, totalExpenses, profit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDailyClosing = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sales = await Sale.find({ date: { $gte: today } });
        const expenses = await Expense.find({ date: { $gte: today } });
        const totalSales = sales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        res.json({ totalSales, totalExpenses, netCash: totalSales - totalExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const threshold = 10;
        const lowStockProducts = await Product.find({ stock: { $lt: threshold } });
        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- New Reports Endpoints ---

exports.getSalesReports = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ date: -1 }).limit(100);
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStockReports = async (req, res) => {
    try {
        const products = await Product.find().select('name stock price category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSalaryReports = async (req, res) => {
    try {
        const staff = await Staff.find().select('name role salary joinDate');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExpensesReports = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRepairProfitReports = async (req, res) => {
    try {
        const repairs = await Repair.find({ status: 'Completed' });
        const totalProfit = repairs.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
        res.json({ repairs, totalProfit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSupplierReports = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVehicleLoadReports = async (req, res) => {
    try {
        const deliveries = await Delivery.find().sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGenericReport = async (req, res) => {
    const { type } = req.params;
    try {
        switch (type) {
            case 'attendance':
                return res.json([
                    { name: 'John Doe', status: 'Present', date: new Date() },
                    { name: 'Jane Smith', status: 'Absent', date: new Date() }
                ]);
            case 'returns':
                return res.json([]);
            case 'sales-person':
                return res.json(await Sale.find().sort({ date: -1 }).limit(50));
            case 'sales-type':
                // Grouping by payment method or just returning list with types
                return res.json(await Sale.find().sort({ date: -1 }).limit(50));
            case 'sales-credit':
                return res.json(await Sale.find({ paymentMethod: 'Credit' }).sort({ date: -1 }));
            case 'cus-credit':
                // Customers with potential balances? For now filter sales
                return res.json(await Sale.find({ paymentMethod: 'Credit' }).sort({ date: -1 }));
            case 'sales-ref':
                // For now just recent sales
                return res.json(await Sale.find().sort({ date: -1 }).limit(50));
            case 'cus-payment':
                return res.json(await Sale.find().sort({ date: -1 }).limit(50));
            default:
                return res.status(404).json({ message: 'Report type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
