const { HirePurchase } = require('../models/AllModels');

// Get all HP accounts
exports.getHPAccounts = async (req, res) => {
    try {
        const accounts = await HirePurchase.find().sort({ createdAt: -1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new HP account (with pre-generated installments from frontend OR auto-generate on server)
exports.createHPAccount = async (req, res) => {
    const account = new HirePurchase(req.body);
    try {
        const newAccount = await account.save();
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Collect payment — mark next installment as paid
exports.collectPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { installmentId, amount } = req.body;

        const account = await HirePurchase.findById(id);
        if (!account) return res.status(404).json({ message: 'HP Account not found' });

        const installment = account.installments.id(installmentId);
        if (!installment) return res.status(404).json({ message: 'Installment not found' });

        installment.paid = true;

        // Check if all installments are paid
        const allPaid = account.installments.every(inst => inst.paid);
        if (allPaid) account.status = 'Completed';

        await account.save();
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an HP account
exports.deleteHPAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await HirePurchase.findByIdAndDelete(id);
        if (!account) return res.status(404).json({ message: 'HP Account not found' });
        res.json({ message: 'HP Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

