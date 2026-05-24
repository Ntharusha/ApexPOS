require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is required');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        const db = mongoose.connection.db;
        const collection = db.collection('categories');

        await collection.dropIndex('name_1');
        console.log('Successfully dropped the unique index on category name.');

        process.exit(0);
    } catch (err) {
        if (err.codeName === 'IndexNotFound') {
            console.log('Index not found, it might have been already dropped.');
            process.exit(0);
        }
        console.error('Error dropping index:', err);
        process.exit(1);
    }
}

fixIndex();
