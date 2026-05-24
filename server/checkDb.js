require('dotenv').config();
const mongoose = require('mongoose');
const { Category } = require('./models/AllModels');
const Product = require('./models/Product');

async function check() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is required');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        const productCount = await Product.countDocuments();
        const categoryCount = await Category.countDocuments();
        console.log(`CHECK: Products: ${productCount}, Categories: ${categoryCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
