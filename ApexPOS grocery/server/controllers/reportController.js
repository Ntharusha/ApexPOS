const { Sale, Expense, Staff, Repair, Supplier, Delivery, Customer, HirePurchase, StockMovement } = require('../models/AllModels');
const Product = require('../models/Product');

// existing ones kept for compatibility
exports.getProfitLoss = async (req, res) => {
    try {
        const sales = await Sale.find();
        const expenses = await Expense.find();
        const totalSales = sales.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
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
        const totalSales = sales.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        res.json({ totalSales, totalExpenses, netCash: totalSales - totalExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.find({ $expr: { $lte: ["$stock", "$minStock"] } });
        res.json(products);
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
        const products = await Product.find().select('name stock price category minStock');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSalaryReports = async (req, res) => {
    try {
        const staff = await Staff.find({ role: { $ne: 'super_admin' } }).select('name role salary joinDate status');
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

exports.getTaxSummary = async (req, res) => {
    try {
        const { year, quarter } = req.query;
        // Default to current quarter if not specified
        const now = new Date();
        const targetYear = parseInt(year) || now.getFullYear();
        const targetQuarter = parseInt(quarter) || Math.floor(now.getMonth() / 3) + 1;

        const startMonth = (targetQuarter - 1) * 3;
        const startDate = new Date(targetYear, startMonth, 1);
        const endDate = new Date(targetYear, startMonth + 3, 0, 23, 59, 59);

        const sales = await Sale.find({ date: { $gte: startDate, $lte: endDate } });

        const summary = {
            quarter: targetQuarter,
            year: targetYear,
            totalTurnover: 0,
            vatCollected: 0,
            ssclCollected: 0,
            saleCount: sales.length
        };

        sales.forEach(s => {
            summary.totalTurnover += (s.totalAmount || 0);
            summary.vatCollected += (s.vatAmount || 0);
            summary.ssclCollected += (s.ssclAmount || 0);
        });

        res.json([summary]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductPerformance = async (req, res) => {
    try {
        const sales = await Sale.find();
        const performance = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                const id = item.productId?.toString() || item.name;
                if (!performance[id]) {
                    performance[id] = { name: item.name, quantitySold: 0, revenue: 0 };
                }
                performance[id].quantitySold += item.quantity;
                performance[id].revenue += item.line_total || (item.price * item.quantity);
            });
        });

        const list = Object.values(performance).sort((a, b) => b.quantitySold - a.quantitySold);
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGenericReport = async (req, res) => {
    const { type } = req.params;
    try {
        switch (type) {
            case 'stock-movement':
                const movements = await StockMovement.find().sort({ createdAt: -1 }).limit(100);
                return res.json(movements);
            case 'hp-collection':

                const hpAccounts = await HirePurchase.find();
                const collections = [];
                hpAccounts.forEach(account => {
                    account.installments.forEach(inst => {
                        if (inst.paid) {
                            collections.push({
                                customer: account.customerName,
                                product: account.productName,
                                date: inst.date,
                                amount: inst.amount
                            });
                        }
                    });
                });
                return res.json(collections.sort((a, b) => b.date - a.date));
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
                return res.json(await Sale.find().sort({ date: -1 }).limit(50));
            case 'sales-credit':
                return res.json(await Sale.find({ paymentStatus: 'Partial' }).sort({ date: -1 }));
            case 'cus-credit':
                return res.json(await Sale.find({ paymentStatus: 'Unpaid' }).sort({ date: -1 }));
            default:
                return res.status(404).json({ message: 'Report type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

