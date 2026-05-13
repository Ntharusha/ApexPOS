const { Shift, Sale, Expense } = require('../models/AllModels');

exports.openShift = async (req, res) => {
    try {
        const { openingFloat, cashierId, cashierName, branchId } = req.body;

        // Check if there's already an open shift for this cashier
        const existingShift = await Shift.findOne({ cashierId, status: 'Open' });
        if (existingShift) {
            return res.status(400).json({ message: 'You already have an open shift. Please close it first.' });
        }

        const shift = new Shift({
            openingFloat,
            cashierId,
            cashierName,
            branchId
        });

        await shift.save();
        res.status(201).json(shift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCurrentShift = async (req, res) => {
    try {
        const { cashierId } = req.query;
        const shift = await Shift.findOne({ cashierId, status: 'Open' });
        res.json(shift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.closeShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { actualCash, notes } = req.body;

        const shift = await Shift.findById(id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });

        // Calculate expected cash
        // Sales that happened during this shift (startTime to now)
        const sales = await Sale.find({
            date: { $gte: shift.startTime },
            cashierName: shift.cashierName // or cashierId if available in sales
        });

        // Sum up only CASH payments
        let cashSales = 0;
        sales.forEach(sale => {
            sale.payments.forEach(p => {
                if (p.method?.toLowerCase() === 'cash') {
                    cashSales += p.amount;
                }
            });
        });

        // Expenses paid in cash during this shift
        const expenses = await Expense.find({
            createdAt: { $gte: shift.startTime },
            category: 'General' // simplified assumption: only general expenses recorded by cashier are cash
        });
        const cashExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const expectedCash = shift.openingFloat + cashSales - cashExpenses;

        shift.actualCash = actualCash;
        shift.expectedCash = expectedCash;
        shift.variance = actualCash - expectedCash;
        shift.endTime = new Date();
        shift.status = 'Closed';
        shift.notes = notes;

        await shift.save();
        res.json(shift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShiftHistory = async (req, res) => {
    try {
        const shifts = await Shift.find().sort({ createdAt: -1 }).limit(50);
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
