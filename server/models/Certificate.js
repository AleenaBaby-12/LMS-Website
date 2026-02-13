const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    serialNumber: {
        type: String,
        default: uuidv4,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// One certificate per student per course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
