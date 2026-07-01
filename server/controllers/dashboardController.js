const { Sale, Repair, Staff, Customer, Expense, Delivery, StockMovement } = require('../models/AllModels');

const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
    try {
        const businessType = req.query.business_type || 'grocery';
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Helper query builder for Sales
        const getSaleQuery = (extraQuery) => {
            const base = { ...extraQuery };
            if (businessType === 'grocery') {
                base.$or = [{ business_type: 'grocery' }, { business_type: { $exists: false } }];
            } else {
                base.business_type = businessType;
            }
            return base;
        };

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
            lowStockCountTotal,
            expiringCountResult
        ] = await Promise.all([
            // Sales today
            Sale.find(getSaleQuery({ date: { $gte: startOfDay } })).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Sales week
            Sale.find(getSaleQuery({ date: { $gte: startOfWeek } })).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Sales month
            Sale.find(getSaleQuery({ date: { $gte: startOfMonth } })).then(sales => sales.reduce((sum, s) => sum + s.totalAmount, 0)),
            // Repairs - Mobile mode only
            businessType === 'mobile' ? Repair.countDocuments({ status: 'Pending' }) : Promise.resolve(0),
            // Products filtered by business_type
            Product.countDocuments({ business_type: businessType }),
            // Staff
            Staff.countDocuments(),
            // Customers
            Customer.countDocuments(),
            // Deliveries - Restaurant and Grocery modes only
            (businessType === 'restaurant' || businessType === 'grocery') ? Delivery.countDocuments({ status: { $in: ['Pending', 'In Transit'] } }) : Promise.resolve(0),
            // Low stock count (using <= 5 as threshold) filtered by business_type
            Product.countDocuments({ stock: { $lte: 5 }, business_type: businessType }),
            // Expiring products (batches expiring within 30 days) filtered by business_type
            Product.countDocuments({ business_type: businessType, 'batches.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() } })
        ]);

        const lowStockItems = await Product.find({ stock: { $lte: 5 }, business_type: businessType }).limit(10).select('name stock category');
        
        const expiringItems = await Product.find({ 
            business_type: businessType,
            'batches.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() } 
        }).limit(10).select('name batches category');

        // 2. Monthly Expenses
        const monthExpenses = await Expense.find({ date: { $gte: startOfMonth } });
        const totalExpensesMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // 3. Brand-wise Summary (Aggregated for efficiency)
        const brandSummary = await Sale.aggregate([
            { 
                $match: getSaleQuery({ date: { $gte: startOfMonth } })
            },
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
        const totalBrands = (await Product.distinct('brand', { business_type: businessType })).length;

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
            totalExpensesMonth,
            expiringCount: expiringCountResult,
            expiringList: expiringItems
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

exports.getSalesTrend = async (req, res) => {
    try {
        const businessType = req.query.business_type || 'grocery';
        const days = 7;
        const salesData = [];

        // Helper query builder for Sales
        const getSaleQuery = (extraQuery) => {
            const base = { ...extraQuery };
            if (businessType === 'grocery') {
                base.$or = [{ business_type: 'grocery' }, { business_type: { $exists: false } }];
            } else {
                base.business_type = businessType;
            }
            return base;
        };

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const sales = await Sale.find(getSaleQuery({
                date: { $gte: date, $lt: nextDate }
            }));

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
        const businessType = req.query.business_type || 'grocery';

        const getSaleQuery = (extraQuery) => {
            const base = { ...extraQuery };
            if (businessType === 'grocery') {
                base.$or = [{ business_type: 'grocery' }, { business_type: { $exists: false } }];
            } else {
                base.business_type = businessType;
            }
            return base;
        };

        const recentSales = await Sale.find(getSaleQuery({}))
            .sort({ date: -1 })
            .limit(5)
            .select('totalAmount paymentMethod date');

        const recentRepairs = businessType === 'mobile'
            ? await Repair.find().sort({ createdAt: -1 }).limit(5).select('customerName deviceModel status createdAt')
            : [];

        // Efficient lookup to find recent stock movements for this business type's products
        const recentMovements = await StockMovement.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 50 }, // Fetch recent ones first to prevent full collection scan during lookup
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    'productInfo.business_type': businessType
                }
            },
            { $limit: 5 }
        ]);

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
            })),
            ...recentMovements.map(move => ({
                type: 'stock',
                message: `Stock ${move.type}: ${move.productName} (${move.quantity})`,
                time: move.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

        res.json(activities);
    } catch (error) {
        console.error("Recent Activity Error:", error);
        res.status(500).json({ message: "Failed to fetch recent activity" });
    }
};
