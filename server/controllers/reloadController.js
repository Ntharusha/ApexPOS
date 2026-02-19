const { Reload } = require('../models/AllModels');

// Process a new reload
exports.processReload = async (req, res) => {
    const reload = new Reload(req.body);
    try {
        const newReload = await reload.save();
        res.status(201).json(newReload);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get reload history
exports.getReloadHistory = async (req, res) => {
    try {
        const history = await Reload.find().sort({ createdAt: -1 }).limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
