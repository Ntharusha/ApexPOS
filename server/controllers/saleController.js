const { Sale, Product } = require('../models/AllModels');
const ProductModel = require('../models/Product'); // Assuming standalone model exists or we use AllModels

// Create a new Sale
exports.createSale = async (req, res) => {
    try {
        console.log("Processing Sale:", req.body);
        const { items, totalAmount, paymentMethod, discount } = req.body;

        // 1. Create Sale Record
        const sale = new Sale({
            items,
            totalAmount,
            discount,
            paymentMethod,
            date: new Date()
        });

        await sale.save();

        // Notify Dashboard via Socket.io
        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        // 2. Update Stock Levels
        // We'll map through items and update each product's stock
        for (const item of items) {
            // Using findByIdAndUpdate to atomic decrement
            await ProductModel.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json(sale);
    } catch (error) {
        console.error("Sale Error:", error);
        res.status(500).json({ message: "Failed to process sale", error: error.message });
    }
};

// Get All Sales (History)
exports.getSales = async (req, res) => {
    try {
        // Sort by date descending (newest first)
        const sales = await Sale.find().sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
