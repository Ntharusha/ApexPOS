const mongoose = require('mongoose');
const { Category } = require('./models/AllModels');
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/apexpos');
        const productCount = await Product.countDocuments();
        const categoryCount = await Category.countDocuments();
        console.log(`CHECK: Products: ${productCount}, Categories: ${categoryCount}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
