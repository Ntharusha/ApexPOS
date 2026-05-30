const { Liability } = require('../models/AllModels');

exports.createLiability = async (req, res) => {
    try {
        const liability = new Liability(req.body);
        await liability.save();
        res.status(201).json(liability);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getLiabilities = async (req, res) => {
    try {
        const liabilities = await Liability.find().sort({ createdAt: -1 });
        res.json(liabilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
