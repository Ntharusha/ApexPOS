const { Sale, Repair } = require('../models/AllModels');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Sales Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        console.log(`[Dashboard] Fetching sales since: ${startOfDay.toISOString()}`);

        const todaySales = await Sale.find({ date: { $gte: startOfDay } });
        console.log(`[Dashboard] Found ${todaySales.length} sales today.`);

        const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        // 2. Pending Repairs
        const pendingRepairsCount = await Repair.countDocuments({ status: 'Pending' });

        // 3. Low Stock Items
        const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });

        // 4. Total Revenue (All Time) - optional
        // const allSales = await Sale.find();
        // const totalRevenue = allSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        res.json({
            dailySales: totalSalesToday,
            pendingRepairs: pendingRepairsCount,
            lowStock: lowStockCount,
            activeDeliveries: 0 // Placeholder until Delivery module is ready
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

        const activities = recentSales.map(sale => ({
            type: 'sale',
            message: `New sale recorded - LKR ${sale.totalAmount.toLocaleString()}`,
            time: sale.date,
            paymentMethod: sale.paymentMethod
        }));

        res.json(activities);
    } catch (error) {
        console.error("Recent Activity Error:", error);
        res.status(500).json({ message: "Failed to fetch recent activity" });
    }
};
