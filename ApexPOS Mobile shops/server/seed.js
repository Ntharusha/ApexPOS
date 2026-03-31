require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apexpos')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const seedProducts = [
    // Phones
    { name: 'iPhone 15 Pro Max', category: 'Phones', price: 450000, costPrice: 420000, stock: 10, barcode: 'IP15PM' },
    { name: 'Samsung S24 Ultra', category: 'Phones', price: 420000, costPrice: 390000, stock: 8, barcode: 'S24ULTRA' },
    { name: 'Redmi Note 13', category: 'Phones', price: 65000, costPrice: 58000, stock: 25, barcode: 'REDMI13' },

    // Accessories
    { name: 'AirPods Pro 2', category: 'Accessories', price: 85000, costPrice: 75000, stock: 15, barcode: 'APP2' },
    { name: 'Samsung 45W Charger', category: 'Accessories', price: 12000, costPrice: 8000, stock: 50, barcode: 'SAM45W' },
    { name: 'Screen Protector (Glass)', category: 'Accessories', price: 1500, costPrice: 200, stock: 200, barcode: 'SPGLASS' },
    { name: 'Silicone Back Cover', category: 'Accessories', price: 2500, costPrice: 500, stock: 150, barcode: 'SBC' },

    // Parts (for repairs)
    { name: 'iPhone X Display (OLED)', category: 'Parts', price: 25000, costPrice: 18000, stock: 5, barcode: 'IPXDISP' },
    { name: 'Samsung A12 Battery', category: 'Parts', price: 4500, costPrice: 3000, stock: 10, barcode: 'A12BATT' }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(seedProducts);
        console.log('Database Seeded!');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

seedDB();
