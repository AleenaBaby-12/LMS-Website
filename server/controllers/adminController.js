const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();

        // Count users by role
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Get Settings for commission
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ commissionPercentage: 20 });
        }
        const commissionRate = settings.commissionPercentage / 100;

        // Calculate Revenue and Commission
        const enrollments = await Enrollment.find({}).populate('course');

        let grossRevenue = 0;
        enrollments.forEach(en => {
            grossRevenue += (en.course?.price || 0);
        });

        const adminEarnings = grossRevenue * commissionRate;
        const teacherPayouts = grossRevenue - adminEarnings;

        res.json({
            stats: {
                totalUsers,
                totalCourses,
                totalEnrollments,
                grossRevenue,
                adminEarnings,
                teacherPayouts,
                commissionPercentage: settings.commissionPercentage,
                roles: {
                    students: studentCount,
                    teachers: teacherCount,
                    admins: adminCount
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending courses for approval
// @route   GET /api/admin/courses/pending
// @access  Private/Admin
const getPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ approvalStatus: 'pending' }).populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course approval status
// @route   PUT /api/admin/courses/:id/approve
// @access  Private/Admin
const updateCourseApproval = async (req, res) => {
    try {
        const { status } = req.body; // approved or rejected
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.approvalStatus = status;
        // If rejected, maybe unpublish it
        if (status === 'rejected') course.isPublished = false;

        await course.save();

        // Notify Instructor
        await Notification.create({
            recipient: course.instructor,
            message: `Your course "${course.title}" has been ${status} by the admin.`,
            type: status === 'approved' ? 'success' : 'error',
            onModel: 'Course',
            relatedId: course._id
        });

        res.json({ message: `Course ${status} successfully`, course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send broadcast notification to all users
// @route   POST /api/admin/broadcast
// @access  Private/Admin
const sendBroadcast = async (req, res) => {
    try {
        const { message, type } = req.body;
        const users = await User.find({ role: { $ne: 'admin' } });

        const notifications = users.map(user => ({
            recipient: user._id,
            message,
            type: type || 'info',
            onModel: 'System'
        }));

        await Notification.insertMany(notifications);

        res.json({ message: `Broadcast sent to ${users.length} users` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Platform Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Platform Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { commissionPercentage, platformName } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({});
        }

        if (commissionPercentage !== undefined) settings.commissionPercentage = commissionPercentage;
        if (platformName) settings.platformName = platformName;

        await settings.save();
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses (approved and pending)
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed sales history
const getSalesHistory = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate('user', 'name email')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset user password (Admin override)
const resetUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    deleteUser,
    getPendingCourses,
    updateCourseApproval,
    sendBroadcast,
    getSettings,
    updateSettings,
    getAllCourses,
    getSalesHistory,
    resetUserPassword
};
