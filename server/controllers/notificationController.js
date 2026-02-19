const { Notification } = require('../models/AllModels');

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear all notifications
exports.clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
