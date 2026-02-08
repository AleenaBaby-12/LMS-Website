const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    commissionPercentage: {
        type: Number,
        default: 20, // Default 20%
        min: 0,
        max: 100
    },
    platformName: {
        type: String,
        default: 'LMS Learning'
    },
    currency: {
        type: String,
        default: 'INR'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
