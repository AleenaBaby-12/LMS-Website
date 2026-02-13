const Badge = require('../models/Badge');
const EarnedBadge = require('../models/EarnedBadge');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Issue a badge to a student
// Internal helper function
const issueBadge = async (studentId, criteriaType, context = {}) => {
    try {
        // Find badge by criteria type (simplification: find the first one that matches)
        // In a more complex system, we'd have specific logic for which badge to award
        const badge = await Badge.findOne({ criteriaType });
        if (!badge) return null;

        // Check if student already has this badge for this specific context
        const query = { student: studentId, badge: badge._id };
        if (context.courseId) query.course = context.courseId;
        if (context.moduleName) query.moduleName = context.moduleName;

        const existing = await EarnedBadge.findOne(query);
        if (existing) return existing;

        const earnedBadge = await EarnedBadge.create({
            student: studentId,
            badge: badge._id,
            course: context.courseId,
            moduleName: context.moduleName
        });

        return earnedBadge;
    } catch (error) {
        console.error('Issue Badge Error:', error);
        return null;
    }
};

// @desc    Issue a certificate for course completion
// Internal helper function
const issueCertificate = async (studentId, courseId) => {
    try {
        const existing = await Certificate.findOne({ student: studentId, course: courseId });
        if (existing) return existing;

        const certificate = await Certificate.create({
            student: studentId,
            course: courseId
        });

        // Also issue "Course Finisher" badge
        await issueBadge(studentId, 'course_completion', { courseId });

        return certificate;
    } catch (error) {
        console.error('Issue Certificate Error:', error);
        return null;
    }
};

// @desc    Get user achievements (badges and certificates)
// @route   GET /api/gamification/my-achievements
// @access  Private
const getMyAchievements = async (req, res) => {
    try {
        const badges = await EarnedBadge.find({ student: req.user._id })
            .populate('badge')
            .populate('course', 'title');

        const certificates = await Certificate.find({ student: req.user._id })
            .populate('course', 'title thumbnail instructor');

        res.json({ badges, certificates });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        // Aggregate to count badges and certificates per student
        const leaderboard = await EarnedBadge.aggregate([
            {
                $group: {
                    _id: '$student',
                    badgeCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    name: '$student.name',
                    profilePicture: '$student.profilePicture',
                    badgeCount: 1,
                    _id: 0
                }
            },
            { $sort: { badgeCount: -1 } },
            { $limit: 10 }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    issueBadge,
    issueCertificate,
    getMyAchievements,
    getLeaderboard
};
