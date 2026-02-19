const Product = require('../models/Product');

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

        // Notify Dashboard via Socket.io if available
        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
