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
    description: String,
    category: { type: String, default: 'General', enum: ['Utilities', 'Rent', 'Salary', 'Inventory', 'Marketing', 'Maintenance', 'Other', 'General'] }
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
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        tax_category: { type: String, enum: ['STANDARD', 'ZERO_RATED', 'EXEMPT'], default: 'STANDARD' },
        tax_amount: { type: Number, default: 0 },
        line_total: Number
    }],
    totalAmount: Number, // Net total
    vatAmount: { type: Number, default: 0 }, // Total VAT
    ssclAmount: { type: Number, default: 0 }, // Total SSCL
    grandTotal: Number, // Gross total (totalAmount + vatAmount + ssclAmount - discount)
    discount: { type: Number, default: 0 },
    payments: [{
        method: { type: String }, // LANKAQR, Cash, Card, etc.
        amount: Number,
        reference: String
    }],
    paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Paid' },
    date: { type: Date, default: Date.now },
    cashierName: String,
    branchId: { type: String, default: 'HQ' }
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
    role: { type: String, required: true, enum: ['super_admin', 'branch_admin', 'manager', 'cashier', 'accountant', 'Admin', 'Technician'] },
    password_hash: { type: String }, // For web dashboard login
    pin_hash: { type: String },       // For fast cashier terminal login
    branch_id: { type: String, default: 'HQ' },
    salary: Number,
    joinDate: { type: Date, default: Date.now },
    address: String,
    nic: String,
    failed_pin_attempts: { type: Number, default: 0 },
    pin_locked_until: { type: Date },
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

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    phone: String,
    tin_number: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const shiftSchema = new mongoose.Schema({
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    cashierName: String,
    branchId: String,
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    openingFloat: { type: Number, required: true },
    actualCash: { type: Number }, // Amount counted at end
    expectedCash: { type: Number }, // Opening Float + Cash Sales - Cash Expenses
    variance: { type: Number },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    notes: String
}, { timestamps: true });

const stockMovementSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
    quantity: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reason: { type: String }, // 'Sale', 'Refill', 'Damage', etc.
    referenceId: { type: String }, // Sale ID or other reference
    user: String
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
    businessName: { type: String, default: 'ApexPOS' },
    vatRate: { type: Number, default: 0.18 },
    ssclRate: { type: Number, default: 0.025 },
    vatEnabled: { type: Boolean, default: true },
    ssclEnabled: { type: Boolean, default: true },
    ssclRetailRatio: { type: Number, default: 0.5 },
    currency: { type: String, default: 'LKR' }
}, { timestamps: true });

const tableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true },
    capacity: Number,
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Bill Requested'], default: 'Available' },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    activeSessionId: { type: String }, // To secure QR ordering per seating session
    branchId: { type: String, default: 'HQ' }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    orderType: { type: String, enum: ['Dine-In', 'Takeaway', 'QR-Order'], default: 'Dine-In' },
    status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        status: { type: String, enum: ['Pending', 'Sent', 'Preparing', 'Ready', 'Served', 'Cancelled'], default: 'Pending' },
        kotPrinted: { type: Boolean, default: false },
        notes: String
    }],
    totalAmount: Number,
    isPaid: { type: Boolean, default: false },
    cashierName: String,
    customerSessionId: String, // Matches table activeSessionId
    branchId: { type: String, default: 'HQ' }
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
    Notification: mongoose.model('Notification', notificationSchema),
    Branch: mongoose.model('Branch', branchSchema),
    Shift: mongoose.model('Shift', shiftSchema),
    StockMovement: mongoose.model('StockMovement', stockMovementSchema),
    Settings: mongoose.model('Settings', settingsSchema),
    Table: mongoose.model('Table', tableSchema),
    Order: mongoose.model('Order', orderSchema)
};




