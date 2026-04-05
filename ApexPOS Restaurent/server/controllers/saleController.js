const { Sale, Notification, StockMovement, Settings, Customer } = require('../models/AllModels');
const ProductModel = require('../models/Product');

const { calculateSaleTax } = require('../utils/taxEngine');

// Create a new Sale
exports.createSale = async (req, res) => {
    try {
        console.log("Processing Sale:", req.body);
        const { items, discount = 0, payments = [], cashierName = 'Unknown', branchId = 'HQ', customerId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        // 0. Fetch global settings for tax rates
        const settings = await Settings.findOne();

        // 1. Process Items (prepare for tax engine)
        const processedItems = items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            tax_category: item.tax_category || 'STANDARD',
            line_total: Number(item.price) * Number(item.quantity),
        }));

        // 2. Use centralized Tax Engine for consistent calculations
        const taxes = calculateSaleTax(processedItems, Number(discount), settings);

        // Enrich items with individual tax amounts
        const enrichedItems = processedItems.map(item => {
            let itemTax = 0;
            if (item.tax_category === 'STANDARD' && (settings?.vatEnabled ?? true)) {
                itemTax = Number((item.line_total * (settings?.vatRate ?? 0.18)).toFixed(2));
            }
            return {
                ...item,
                tax_amount: itemTax
            };
        });


        // 3. Determine payment status
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        let paymentStatus = 'Unpaid';
        if (totalPaid >= taxes.grandTotal) paymentStatus = 'Paid';
        else if (totalPaid > 0) paymentStatus = 'Partial';

        // 4. Create Sale Record
        const sale = new Sale({
            customerId: customerId || undefined,
            items: enrichedItems,
            totalAmount: taxes.subtotal,
            vatAmount: taxes.vatAmount,
            ssclAmount: taxes.ssclAmount,
            grandTotal: taxes.grandTotal,
            discount: Number(discount),
            payments,
            paymentStatus,
            cashierName,
            branchId,
            date: new Date()
        });


        await sale.save();

        // Update Customer stats if linked
        if (customerId) {
            try {
                await Customer.findByIdAndUpdate(customerId, {
                    $inc: {
                        totalPurchases: taxes.grandTotal,
                        loyaltyPoints: Math.floor(taxes.grandTotal / 100) // 1 point per 100 LKR
                    }
                });
            } catch (e) {
                console.warn('Failed to update customer stats:', e.message);
            }
        }

        // Notify Dashboard via Socket.io
        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        // 5. Update Stock Levels (with FEFO support)
        for (const item of items) {
            const product = await ProductModel.findById(item.productId);
            if (!product) continue;

            let remainingToDeduct = Number(item.quantity);

            // Check for Batch support (Pharmacy FEFO)
            if (product.batches && product.batches.length > 0) {
                // Sort batches by expiryDate ascending
                product.batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

                for (let i = 0; i < product.batches.length && remainingToDeduct > 0; i++) {
                    const batch = product.batches[i];
                    const deductFromBatch = Math.min(batch.quantity, remainingToDeduct);

                    batch.quantity -= deductFromBatch;
                    remainingToDeduct -= deductFromBatch;
                }
            }

            // Fallback: If still quantity remaining or no batches, deduct from main stock
            product.stock -= Number(item.quantity);
            await product.save();

            // Log stock movement
            await StockMovement.create({
                productId: product._id,
                productName: product.name,
                type: 'OUT',
                quantity: item.quantity,
                balanceAfter: product.stock,
                reason: 'Sale',
                referenceId: sale._id,
                user: cashierName
            });

            // 6. Low Stock Notification
            if (product.stock <= (product.minStock || 5)) {
                const existingNotif = await Notification.findOne({
                    title: 'Low Stock Alert',
                    description: { $regex: product.name },
                    isRead: false
                });

                if (!existingNotif) {
                    await Notification.create({
                        title: 'Low Stock Alert',
                        description: `Product "${product.name}" is running low on stock (${product.stock} remaining).`,
                        type: 'Warning',
                        isRead: false
                    });

                    // Emit socket update for notifications
                    if (io) io.emit('notificationUpdate');
                }
            }
        }


        res.status(201).json(sale);
    } catch (error) {
        console.error("Sale Error:", error);
        res.status(500).json({ message: "Failed to process sale", error: error.message });
    }
};

// Get All Sales (History)
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
