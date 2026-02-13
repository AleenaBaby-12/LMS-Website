const mongoose = require('mongoose');

const mentorConnectionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
mentorConnectionSchema.index({ student: 1, mentor: 1 });
mentorConnectionSchema.index({ mentor: 1, status: 1 });
mentorConnectionSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('MentorConnection', mentorConnectionSchema);
