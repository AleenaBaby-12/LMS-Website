const mongoose = require('mongoose');

const earnedBadgeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    moduleName: {
        type: String
    },
    earnedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate badges for the same specific context (e.g. same course completion)
earnedBadgeSchema.index({ student: 1, badge: 1, course: 1, moduleName: 1 }, { unique: true });

const EarnedBadge = mongoose.model('EarnedBadge', earnedBadgeSchema);
module.exports = EarnedBadge;
