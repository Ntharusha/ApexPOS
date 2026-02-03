const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    barcode: { type: String, sparse: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    image: { type: String }, // URL or base64
    warranty: { type: String }, // e.g., "6 months"
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
