const { Delivery } = require('../models/AllModels');

// Get all deliveries
exports.getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find().sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a delivery
exports.createDelivery = async (req, res) => {
    const delivery = new Delivery(req.body);
    try {
        const newDelivery = await delivery.save();

        const io = req.app.get('io');
        if (io) io.emit('dashboardUpdate');

        res.status(201).json(newDelivery);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await Delivery.findByIdAndDelete(id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        res.json({ message: 'Delivery deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
