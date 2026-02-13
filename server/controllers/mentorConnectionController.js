const MentorConnection = require('../models/MentorConnection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request to mentor
// @route   POST /api/mentor-connections/request
// @access  Private (Student)
const sendConnectionRequest = async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        const studentId = req.user._id;

        // Verify mentor exists and is actually a mentor/teacher
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (!mentor.isMentor && mentor.role !== 'teacher') {
            return res.status(400).json({ message: 'This user is not a mentor' });
        }

        // Check if connection already exists
        const existingConnection = await MentorConnection.findOne({
            student: studentId,
            mentor: mentorId,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingConnection) {
            return res.status(400).json({
                message: existingConnection.status === 'pending'
                    ? 'Connection request already pending'
                    : 'Already connected with this mentor'
            });
        }

        // Create connection request
        const connection = await MentorConnection.create({
            student: studentId,
            mentor: mentorId,
            message: message || '',
            status: 'pending'
        });

        // Create notification for mentor
        try {
            const notification = await Notification.create({
                recipient: mentorId,
                type: 'info',
                message: `${req.user.name} wants to connect with you as a mentor`
            });
            console.log('Notification created successfully:', notification._id);
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json({
            message: 'Connection request sent successfully',
            connection
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to connection request (accept/reject)
// @route   PUT /api/mentor-connections/:id/respond
// @access  Private (Mentor)
const respondToRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const connection = await MentorConnection.findById(id).populate('student', 'name');

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Verify the current user is the mentor
        if (connection.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        connection.status = status;
        await connection.save();

        // Create notification for student
        await Notification.create({
            recipient: connection.student._id,
            type: status === 'accepted' ? 'success' : 'info',
            message: `${req.user.name} ${status === 'accepted' ? 'accepted' : 'declined'} your mentorship request`
        });

        res.json({
            message: `Request ${status} successfully`,
            connection
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's connections (accepted)
// @route   GET /api/mentor-connections/my-connections
// @access  Private
const getMyConnections = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get connections where user is either student or mentor
        const connections = await MentorConnection.find({
            $or: [
                { student: userId },
                { mentor: userId }
            ],
            status: 'accepted'
        })
            .populate('student', 'name email profilePicture')
            .populate('mentor', 'name email profilePicture role')
            .sort({ updatedAt: -1 });

        // For each connection, get the unread message count from the peer
        const Message = require('../models/Message');
        const connectionsWithUnread = await Promise.all(connections.map(async (conn) => {
            const peerId = conn.student._id.toString() === userId.toString() ? conn.mentor._id : conn.student._id;
            const unreadCount = await Message.countDocuments({
                sender: peerId,
                recipient: userId,
                isRead: false
            });

            return {
                ...conn.toObject(),
                unreadCount
            };
        }));

        res.json(connectionsWithUnread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending requests (for mentors)
// @route   GET /api/mentor-connections/pending
// @access  Private (Mentor)
const getPendingRequests = async (req, res) => {
    try {
        const requests = await MentorConnection.find({
            mentor: req.user._id,
            status: 'pending'
        })
            .populate('student', 'name email profilePicture')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get connection status with a specific mentor
// @route   GET /api/mentor-connections/status/:mentorId
// @access  Private
const getConnectionStatus = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const studentId = req.user._id;

        const connection = await MentorConnection.findOne({
            student: studentId,
            mentor: mentorId
        }).sort({ createdAt: -1 });

        if (!connection) {
            return res.json({ status: 'none' });
        }

        res.json({
            status: connection.status,
            connectionId: connection._id,
            createdAt: connection.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mentor contact info (only if connected)
// @route   GET /api/mentor-connections/:id/contact
// @access  Private
const getMentorContact = async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await MentorConnection.findById(id)
            .populate('mentor', 'name email profilePicture');

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        // Verify user is part of this connection
        const userId = req.user._id.toString();
        if (connection.student.toString() !== userId && connection.mentor._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (connection.status !== 'accepted') {
            return res.status(403).json({ message: 'Connection not accepted yet' });
        }

        res.json({ mentor: connection.mentor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendConnectionRequest,
    respondToRequest,
    getMyConnections,
    getPendingRequests,
    getConnectionStatus,
    getMentorContact
};
