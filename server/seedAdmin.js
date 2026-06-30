require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Staff } = require('./models/AllModels');

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is required.');
    process.exit(1);
}

async function seedAdmin() {
    try {
        await mongoose.connect(uri);
        
        // Check if admin already exists
        const adminEmail = 'admin@apexpos.com';
        const existing = await Staff.findOne({ email: adminEmail });
        
        if (existing) {
            console.log('✅ Admin user already exists.');
            process.exit(0);
        }

        // Hash password and PIN
        const passwordHash = await bcrypt.hash('admin123', 12);
        const pinHash = await bcrypt.hash('1234', 10);

        const adminUser = new Staff({
            name: 'System Admin',
            email: adminEmail,
            password_hash: passwordHash,
            pin_hash: pinHash,
            role: 'super_admin',
            branch_id: 'HQ',
            status: 'Active'
        });

        await adminUser.save();
        console.log('🚀 Default Admin user successfully seeded!');
        console.log('Email: admin@apexpos.com');
        console.log('Password: admin123');
        console.log('PIN: 1234');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
    }
}

seedAdmin();
