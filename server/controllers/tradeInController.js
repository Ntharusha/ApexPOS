const { TradeIn } = require('../models/AllModels');

exports.createTradeIn = async (req, res) => {
    try {
        const tradeIn = new TradeIn(req.body);
        await tradeIn.save();
        res.status(201).json(tradeIn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTradeIns = async (req, res) => {
    try {
        const tradeIns = await TradeIn.find().sort({ createdAt: -1 });
        res.json(tradeIns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
