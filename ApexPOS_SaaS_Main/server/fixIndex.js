const mongoose = require('mongoose');

async function fixIndex() {
    try {
        await mongoose.connect('mongodb+srv://apexpos:yqrqhN37S2dFBdw2@apexpos.rscehtw.mongodb.net/');
        console.log('Connected to MongoDB...');
        
        const db = mongoose.connection.db;
        const collection = db.collection('categories');
        
        // Drop the unique index on 'name'
        await collection.dropIndex('name_1');
        console.log('Successfully dropped the unique index on category name.');
        
        process.exit();
    } catch (err) {
        if (err.codeName === 'IndexNotFound') {
            console.log('Index not found, it might have been already dropped.');
            process.exit();
        }
        console.error('Error dropping index:', err);
        process.exit(1);
    }
}

fixIndex();
