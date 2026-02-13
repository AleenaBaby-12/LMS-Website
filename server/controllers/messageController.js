const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        if (!recipientId || !content) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name profilePicture')
            .populate('recipient', 'name profilePicture');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
};

// @desc    Get conversation history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const myId = req.user._id;
        const otherId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: otherId },
                { sender: otherId, recipient: myId }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profilePicture')
            .populate('recipient', 'name profilePicture');

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Server error while fetching conversation' });
    }
};

// @desc    Mark a conversation as read
// @route   PUT /api/messages/mark-conversation-read/:userId
// @access  Private
const markConversationRead = async (req, res) => {
    try {
        const myId = req.user._id;
        const otherId = req.params.userId;

        await Message.updateMany(
            { sender: otherId, recipient: myId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: 'Conversation marked as read' });
    } catch (error) {
        console.error('Error marking conversation read:', error);
        res.status(500).json({ message: 'Server error while marking conversation read' });
    }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Server error while fetching unread count' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    markConversationRead,
    getUnreadCount
};
