const { Sale, Repair, Staff, Customer, Expense, Delivery } = require('../models/AllModels');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // 1. Parallel counts and sales data
        const [
            totalSalesToday,
            totalSalesWeek,
            totalSalesMonth,
            pendingRepairsCount,
            totalProducts,
            totalEmployees,
            totalCustomers,
            activeDeliveriesCount,
            lowStockCountTotal
        ] = await Promise.all([
            // Sales today
            Sale.find({ date: { $gte: startOfDay } }).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Sales week
            Sale.find({ date: { $gte: startOfWeek } }).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Sales month
            Sale.find({ date: { $gte: startOfMonth } }).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Repairs
            Repair.countDocuments({ status: 'Pending' }),
            // Products
            Product.countDocuments(),
            // Staff
            Staff.countDocuments(),
            // Customers
            Customer.countDocuments(),
            // Deliveries
            Delivery.countDocuments({ status: { $in: ['Pending', 'In Transit'] } }),
            // Low stock count (using <= 5 as threshold)
            Product.countDocuments({ stock: { $lte: 5 } })
        ]);

        const lowStockItems = await Product.find({ stock: { $lte: 5 } }).limit(10).select('name stock category');

        // 2. Monthly Expenses
        const monthExpenses = await Expense.find({ date: { $gte: startOfMonth } });
        const totalExpensesMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // 3. Brand-wise Summary (Aggregated for efficiency)
        const brandSummary = await Sale.aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$productInfo.brand', 'Generic'] },
                    value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $project: { name: '$_id', value: 1, _id: 0 } },
            { $sort: { value: -1 } },
            { $limit: 5 }
        ]);

        // 4. Total Brands
        const totalBrands = (await Product.distinct('brand')).length;

        res.json({
            dailySales: totalSalesToday,
            weeklySales: totalSalesWeek,
            monthlySales: totalSalesMonth,
            pendingRepairs: pendingRepairsCount,
            lowStockCount: lowStockCountTotal,
            lowStockList: lowStockItems,
            brandSummary,
            activeDeliveries: activeDeliveriesCount,
            totalProducts,
            totalEmployees,
            totalBrands,
            totalCustomers,
            totalExpensesMonth
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

exports.getSalesTrend = async (req, res) => {
    try {
        const days = 7;
        const salesData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const sales = await Sale.find({
                date: { $gte: date, $lt: nextDate }
            });

            const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

            salesData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sales: total
            });
        }

        res.json(salesData);
    } catch (error) {
        console.error("Sales Trend Error:", error);
        res.status(500).json({ message: "Failed to fetch sales trend" });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const recentSales = await Sale.find()
            .sort({ date: -1 })
            .limit(5)
            .select('totalAmount paymentMethod date');

        const recentRepairs = await Repair.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('customerName deviceModel status createdAt');

        const activities = [
            ...recentSales.map(sale => ({
                type: 'sale',
                message: `Sale recorded: LKR ${sale.totalAmount.toLocaleString()}`,
                time: sale.date
            })),
            ...recentRepairs.map(repair => ({
                type: 'repair',
                message: `Repair ${repair.status}: ${repair.deviceModel} (${repair.customerName})`,
                time: repair.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json(activities);
    } catch (error) {
        console.error("Recent Activity Error:", error);
        res.status(500).json({ message: "Failed to fetch recent activity" });
    }
};
