const mongoose = require('mongoose');
const Product = require('./models/Product');
const { Category } = require('./models/AllModels');
require('dotenv').config();

const groceryItems = [
    {
        name: 'Fresh Cow Milk (1L)',
        name_si: 'නැවුම් කිරි (ලීටර් 1)',
        category: 'Dairy',
        sku: 'DAI-001',
        price: 450,
        costPrice: 380,
        stock: 50,
        tax_category: 'EXEMPT',
        batches: [
            { batchNumber: 'BAT-MILK-01', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), quantity: 25, costPrice: 380 }, // Expires in 5 days
            { batchNumber: 'BAT-MILK-02', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), quantity: 25, costPrice: 380 }
        ]
    },
    {
        name: 'Whole Wheat Bread',
        name_si: 'තිරිඟු පාන්',
        category: 'Bakery',
        sku: 'BAK-001',
        price: 190,
        costPrice: 150,
        stock: 30,
        tax_category: 'EXEMPT',
        batches: [
            { batchNumber: 'BAK-01', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quantity: 30, costPrice: 150 } // Expires in 2 days
        ]
    },
    {
        name: 'Red Onions (1kg)',
        name_si: 'රතු ළූණු (කි.ග්‍රෑ 1)',
        category: 'Vegetables',
        sku: 'VEG-001',
        price: 650,
        costPrice: 500,
        stock: 100,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'ONI-01', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), quantity: 100, costPrice: 500 }
        ]
    },
    {
        name: 'Chicken Breast (500g)',
        name_si: 'කුකුළු මස් (ග්‍රෑම් 500)',
        category: 'Meat',
        sku: 'MEA-001',
        price: 850,
        costPrice: 700,
        stock: 40,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'CHICK-01', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), quantity: 40, costPrice: 700 } // Expires in 7 days
        ]
    },
    {
        name: 'Lipton Ceylonta Tea (400g)',
        name_si: 'ලිප්ටන් තේ (ග්‍රෑම් 400)',
        category: 'Grocery',
        sku: 'GRO-001',
        price: 1250,
        costPrice: 1100,
        stock: 60,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'TEA-01', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), quantity: 60, costPrice: 1100 }
        ]
    },
    {
        name: 'Anchor Milk Powder (400g)',
        name_si: 'ඈන්කර් කිරිපිටි (ග්‍රෑම් 400)',
        category: 'Dairy',
        sku: 'DAI-002',
        price: 1150,
        costPrice: 1050,
        stock: 80,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'ANC-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), quantity: 80, costPrice: 1050 }
        ]
    },
    {
        name: 'Munchee Super Cream Cracker',
        name_si: 'මංචි ක්‍රීම් ක්‍රැකර්',
        category: 'Biscuits',
        sku: 'BIS-001',
        barcode: '4792011122334',
        price: 260,
        costPrice: 220,
        stock: 120,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'BIS-01', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), quantity: 120, costPrice: 220 }
        ]
    },
    {
        name: 'Coca-Cola (1.5L)',
        name_si: 'කොකා-කෝලා (ලීටර් 1.5)',
        category: 'Beverages',
        sku: 'BEV-001',
        barcode: '5449000000996',
        price: 380,
        costPrice: 320,
        stock: 45,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'COKE-01', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), quantity: 45, costPrice: 320 }
        ]
    },
    {
        name: 'Keeri Samba Rice (5kg)',
        name_si: 'කීරි සම්බා සහල් (කි.ග්‍රෑ 5)',
        category: 'Grains',
        sku: 'GRA-001',
        barcode: '4796000000112',
        price: 1550,
        costPrice: 1400,
        stock: 25,
        tax_category: 'EXEMPT',
        batches: [
            { batchNumber: 'RICE-01', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), quantity: 25, costPrice: 1400 }
        ]
    },
    {
        name: 'Red Apple (Fuji)',
        name_si: 'රතු ඇපල්',
        category: 'Fruits',
        sku: 'FRU-001',
        barcode: '4001',
        price: 120,
        costPrice: 90,
        stock: 150,
        tax_category: 'EXEMPT',
        batches: [
            { batchNumber: 'APP-01', expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), quantity: 150, costPrice: 90 }
        ]
    },
    {
        name: 'Cavendish Banana',
        name_si: 'පැනමා කෙසෙල්',
        category: 'Fruits',
        sku: 'FRU-002',
        price: 350,
        costPrice: 280,
        stock: 60,
        tax_category: 'EXEMPT',
        batches: [
            { batchNumber: 'BAN-01', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), quantity: 60, costPrice: 280 }
        ]
    },
    {
        name: 'Lux Soap (100g)',
        name_si: 'ලක්ස් සබන් (ග්‍රෑම් 100)',
        category: 'Personal Care',
        sku: 'PER-001',
        barcode: '8901030000012',
        price: 185,
        costPrice: 150,
        stock: 200,
        tax_category: 'STANDARD',
        batches: [
            { batchNumber: 'SOAP-01', expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), quantity: 200, costPrice: 150 }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apexpos');
        console.log('Connected to MongoDB for Seeding...');

        // Create categories if they don't exist
        const categories = [...new Set(groceryItems.map(item => item.category))];
        for (const catName of categories) {
            await Category.findOneAndUpdate(
                { name: catName },
                { name: catName },
                { upsert: true, new: true }
            );
        }
        console.log('Categories synced.');

        // Insert products
        for (const item of groceryItems) {
            await Product.findOneAndUpdate(
                { sku: item.sku },
                item,
                { upsert: true, new: true }
            );
        }
        console.log('Grocery items seeded successfully!');

        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (err) {
        console.error('Seeding Error:', err);
    }
};

seedDB();
