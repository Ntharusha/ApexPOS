const { Expense } = require('../models/AllModels');

// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    const expense = new Expense(req.body);
    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await Expense.findByIdAndDelete(id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
