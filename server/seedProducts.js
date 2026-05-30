const mongoose = require('mongoose');
const { Category } = require('./models/AllModels');
const Product = require('./models/Product');

const mongoURI = 'mongodb://localhost:27017/apexpos';

const seedCategories = [
    // Grocery
    { name: 'Fruits', business_type: 'grocery', icon: '🍎' },
    { name: 'Vegetables', business_type: 'grocery', icon: '🥦' },
    { name: 'Beverages', business_type: 'grocery', icon: '🥤' },
    { name: 'Dairy', business_type: 'grocery', icon: '🥛' },
    { name: 'Bakery', business_type: 'grocery', icon: '🍞' },
    { name: 'Meat & Seafood', business_type: 'grocery', icon: '🥩' },
    
    // Mobile
    { name: 'Smartphones', business_type: 'mobile', icon: '📱' },
    { name: 'Tablets', business_type: 'mobile', icon: '平板' },
    { name: 'Accessories', business_type: 'mobile', icon: '🎧' },
    { name: 'Wearables', business_type: 'mobile', icon: '⌚' },
    { name: 'Repairs', business_type: 'mobile', icon: '🔧' },
    
    // Restaurant
    { name: 'Main Course', business_type: 'restaurant', icon: '🍽️' },
    { name: 'Fast Food', business_type: 'restaurant', icon: '🍔' },
    { name: 'Pizza', business_type: 'restaurant', icon: '🍕' },
    { name: 'Beverages', business_type: 'restaurant', icon: '🍷' },
    { name: 'Desserts', business_type: 'restaurant', icon: '🍰' },
    { name: 'Appetizers', business_type: 'restaurant', icon: '🥗' }
];

const seedProducts = [
    // --- Grocery ---
    { name: 'Fresh Red Apples', category: 'Fruits', price: 450, stock: 100, business_type: 'grocery' },
    { name: 'Organic Spinach', category: 'Vegetables', price: 120, stock: 50, business_type: 'grocery' },
    { name: 'Full Cream Milk (1L)', category: 'Dairy', price: 480, stock: 80, business_type: 'grocery' },
    { name: 'Fresh White Bread', category: 'Bakery', price: 210, stock: 30, business_type: 'grocery' },
    { name: 'Chicken Breast (500g)', category: 'Meat & Seafood', price: 950, stock: 45, business_type: 'grocery' },
    { name: 'Coca Cola (1.5L)', category: 'Beverages', price: 380, stock: 120, business_type: 'grocery' },
    { name: 'Bananas (1kg)', category: 'Fruits', price: 280, stock: 150, business_type: 'grocery' },
    { name: 'Brown Eggs (10pk)', category: 'Dairy', price: 420, stock: 60, business_type: 'grocery' },
    
    // --- Mobile Shop ---
    { name: 'iPhone 15 Pro 256GB', category: 'Smartphones', price: 425000, stock: 5, business_type: 'mobile' },
    { name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', price: 395000, stock: 8, business_type: 'mobile' },
    { name: 'iPad Air M2', category: 'Tablets', price: 245000, stock: 4, business_type: 'mobile' },
    { name: 'AirPods Pro (2nd Gen)', category: 'Accessories', price: 85000, stock: 15, business_type: 'mobile' },
    { name: 'Tempered Glass (Universal)', category: 'Accessories', price: 1500, stock: 150, business_type: 'mobile' },
    { name: 'Fast Charger 20W', category: 'Accessories', price: 4500, stock: 40, business_type: 'mobile' },
    { name: 'Apple Watch Series 9', category: 'Wearables', price: 155000, stock: 6, business_type: 'mobile' },
    { name: 'Screen Replacement (Generic)', category: 'Repairs', price: 12500, stock: 99, business_type: 'mobile' },

    // --- Restaurant ---
    { name: 'Cheese Burger Combo', category: 'Fast Food', price: 1850, stock: 999, business_type: 'restaurant' },
    { name: 'Grilled Chicken Pizza', category: 'Pizza', price: 2400, stock: 999, business_type: 'restaurant' },
    { name: 'Spaghetti Carbonara', category: 'Main Course', price: 2100, stock: 999, business_type: 'restaurant' },
    { name: 'Chicken Caesar Salad', category: 'Appetizers', price: 1450, stock: 999, business_type: 'restaurant' },
    { name: 'Fresh Lime Juice', category: 'Beverages', price: 450, stock: 999, business_type: 'restaurant' },
    { name: 'Chocolate Lava Cake', category: 'Desserts', price: 1200, stock: 999, business_type: 'restaurant' },
    { name: 'Cappuccino', category: 'Beverages', price: 850, stock: 999, business_type: 'restaurant' },
    { name: 'Garlic Bread (4pcs)', category: 'Appetizers', price: 650, stock: 999, business_type: 'restaurant' }
];

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');
        
        await Category.deleteMany({});
        await Category.insertMany(seedCategories);
        console.log('Categories seeded!');

        await Product.deleteMany({});
        await Product.insertMany(seedProducts);
        console.log('Products seeded!');
        
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
