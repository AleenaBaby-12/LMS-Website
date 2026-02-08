const Notification = require('../models/Notification');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching notifications for user: ${req.user._id}`);
        // Use _id for strict ObjectId matching
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to last 50 notifications

        console.log(`[DEBUG] Found ${notifications.length} notifications`);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Ensure the notification belongs to the user
        // Use toString() for safe comparison
        if (notification.recipient.toString() !== req.user.id && notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper: Create a notification (Internal use mainly)
exports.createNotification = async ({ recipient, message, type = 'info', relatedId = null, onModel = null }) => {
    try {
        const notification = await Notification.create({
            recipient,
            message,
            type,
            relatedId,
            onModel
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Test notification
exports.sendTestNotification = async (req, res) => {
    try {
        await exports.createNotification({
            recipient: req.user._id,
            message: 'Test notification verified!',
            type: 'success',
            onModel: 'System'
        });
        res.json({ message: 'Sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
