const Product = require('../models/Product');
const { StockMovement } = require('../models/AllModels');


// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a product
exports.createProduct = async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update product stock (for POS)
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // quantity to deduct
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.stock -= quantity;
        if (product.stock < 0) product.stock = 0; // Prevent negative stock for now or allow backorder

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refill product stock
exports.refillStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // quantity to add
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.stock += Number(quantity);
        await product.save();

        // Log movement
        await StockMovement.create({
            productId: product._id,
            productName: product.name,
            type: 'IN',
            quantity: Number(quantity),
            balanceAfter: product.stock,
            reason: 'Refill',
            user: 'System/Manager'
        });

        // Notify Dashboard via Socket.io if available

        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new batch to a product
exports.addBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchNumber, expiryDate, quantity, costPrice, mfgDate } = req.body;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.batches.push({ batchNumber, expiryDate, quantity: Number(quantity), costPrice: Number(costPrice), mfgDate });
        product.stock += Number(quantity);

        await product.save();

        // Log movement
        await StockMovement.create({
            productId: product._id,
            productName: product.name,
            type: 'IN',
            quantity: Number(quantity),
            balanceAfter: product.stock,
            reason: `Batch Refill (${batchNumber})`,
            user: 'Manager'
        });

        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check for nearing expiries and notify
exports.checkExpiries = async (req, res) => {
    try {
        const products = await Product.find({ 'batches.expiryDate': { $exists: true } });
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        let alertCount = 0;
        const { Notification } = require('../models/AllModels');

        for (const p of products) {
            const expiringSoon = p.batches.filter(b => b.quantity > 0 && new Date(b.expiryDate) <= thirtyDaysFromNow);
            if (expiringSoon.length > 0) {
                // Create notification
                await Notification.create({
                    title: 'Batch Expiry Warning',
                    description: `Product "${p.name}" has ${expiringSoon.length} batch(es) expiring soon.`,
                    type: 'Alert',
                    isRead: false
                });
                alertCount++;
            }
        }

        res.json({ message: `Scanned ${products.length} products, created ${alertCount} alerts.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


