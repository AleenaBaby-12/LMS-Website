const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Badge = require('../models/Badge');
const EarnedBadge = require('../models/EarnedBadge');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // 1. Find the User
    const user = await User.findOne({ name: /Nandana/i });
    if (!user) {
        console.log('User Nandana not found');
        process.exit();
    }
    console.log(`Found User: ${user.name} (${user._id})`);

    // 2. Find the Badge
    const badge = await Badge.findOne({ title: /Curtain Raiser/i });
    if (!badge) {
        console.log('Badge "Curtain Raiser" not found');
        process.exit();
    }
    console.log(`Found Badge: ${badge.title} (${badge._id})`);

    // 3. Delete the EarnedBadge entry
    const result = await EarnedBadge.deleteMany({
        student: user._id,
        badge: badge._id
    });

    console.log(`Successfully removed ${result.deletedCount} instance(s) of "${badge.title}" badge from ${user.name}.`);
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
