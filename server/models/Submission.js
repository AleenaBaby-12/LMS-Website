const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String, // Text answer or URL to file
        required: true
    },
    attachments: [{
        name: String,
        url: String
    }],
    status: {
        type: String,
        enum: ['submitted', 'graded', 'late'],
        default: 'submitted'
    },
    grade: {
        type: Number
    },
    feedback: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent multiple submissions for same assignment by same student (optional, can be removed if resubmissions allowed)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
