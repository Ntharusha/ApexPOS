const mongoose = require('mongoose');
const { Category } = require('./models/AllModels');
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect('mongodb+srv://apexpos:yqrqhN37S2dFBdw2@apexpos.rscehtw.mongodb.net/');
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
