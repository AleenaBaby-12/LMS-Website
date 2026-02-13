const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // SVG path or URL
        required: true
    },
    criteriaType: {
        type: String,
        enum: ['course_completion', 'module_completion', 'engagement', 'score'],
        required: true
    },
    points: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
