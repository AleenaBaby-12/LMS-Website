const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    salaryRange: {
        type: String, // e.g., "$80,000 - $120,000"
        default: "Market Competitive"
    },
    jobRoles: [{
        type: String, // e.g., "Frontend Engineer", "UI Developer"
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    icon: {
        type: String, // URL or icon name
        default: 'Briefcase'
    }
}, { timestamps: true });

const CareerPath = mongoose.model('CareerPath', careerPathSchema);
module.exports = CareerPath;
