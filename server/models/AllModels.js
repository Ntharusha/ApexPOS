const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    deviceModel: String,
    imei: String,
    issueDescription: String,
    status: { type: String, default: 'Pending' },
    estimatedCost: Number,
    technicianNotes: String
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: String,
    description: String
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
    type: String,
    amount: Number,
    date: Date,
    description: String
}, { timestamps: true });

const hpSchema = new mongoose.Schema({
    customerName: String,
    customerNic: String,
    productName: String,
    totalAmount: Number,
    downPayment: Number,
    installments: [{ date: Date, amount: Number, paid: Boolean }],
    status: { type: String, default: 'Active' }
}, { timestamps: true });

const saleSchema = new mongoose.Schema({
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: Number,
    discount: { type: Number, default: 0 },
    paymentMethod: String,
    date: { type: Date, default: Date.now }
});

const deliverySchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: String,
    customerAddress: { type: String, required: true },
    items: [{
        productName: String,
        quantity: Number
    }],
    totalAmount: Number,
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'] },
    trackingNumber: String,
    deliveryDate: Date,
    notes: String
}, { timestamps: true });

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    role: { type: String, required: true, enum: ['Admin', 'Cashier', 'Technician', 'Manager'] },
    salary: Number,
    joinDate: { type: Date, default: Date.now },
    address: String,
    nic: String,
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    address: String,
    nic: String,
    totalPurchases: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, { timestamps: true });

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: String,
    email: String,
    phone: { type: String, required: true },
    address: String,
    productsSupplied: [String],
    paymentTerms: String,
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, { timestamps: true });

const reloadSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    number: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Completed' }, // For now, assume completed
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Info', 'Warning', 'Alert', 'Success'], default: 'Info' },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
    Repair: mongoose.model('Repair', repairSchema),
    Category: mongoose.model('Category', categorySchema),
    Expense: mongoose.model('Expense', expenseSchema),
    HirePurchase: mongoose.model('HirePurchase', hpSchema),
    Sale: mongoose.model('Sale', saleSchema),
    Delivery: mongoose.model('Delivery', deliverySchema),
    Staff: mongoose.model('Staff', staffSchema),
    Customer: mongoose.model('Customer', customerSchema),
    Supplier: mongoose.model('Supplier', supplierSchema),
    Reload: mongoose.model('Reload', reloadSchema),
    Notification: mongoose.model('Notification', notificationSchema)
};
