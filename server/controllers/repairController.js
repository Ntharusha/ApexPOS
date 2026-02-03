const { Repair } = require('../models/AllModels');

// Get all repairs
exports.getRepairs = async (req, res) => {
    try {
        const repairs = await Repair.find().sort({ createdAt: -1 });
        res.json(repairs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new repair job
exports.createRepair = async (req, res) => {
    try {
        const repair = new Repair(req.body);
        const newRepair = await repair.save();
        res.status(201).json(newRepair);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update repair stats
exports.updateRepairStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const repair = await Repair.findByIdAndUpdate(id, { status }, { new: true });
        res.json(repair);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
