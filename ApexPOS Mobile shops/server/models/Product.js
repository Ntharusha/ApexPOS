const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    name_si: { type: String },
    name_ta: { type: String },
    barcode: { type: String, sparse: true },
    sku: { type: String },
    category: { type: String, required: true },
    tax_category: { type: String, enum: ['STANDARD', 'ZERO_RATED', 'EXEMPT'], default: 'STANDARD' },
    brand: { type: String, default: 'Generic' },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    image: { type: String }, // URL or base64
    warranty: { type: String }, // e.g., "6 months"
    description: { type: String },
    is_active: { type: Boolean, default: true },
    is_controlled_substance: { type: Boolean, default: false },
    branch_id: { type: String, default: 'HQ' },
    batches: [{
        batchNumber: { type: String, required: true },
        expiryDate: { type: Date, required: true },
        quantity: { type: Number, default: 0 },
        costPrice: { type: Number },
        mfgDate: { type: Date }
    }]
}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema);
