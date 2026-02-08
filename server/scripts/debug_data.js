const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Checking Courses ---');
        const courses = await Course.find({});
        courses.forEach(c => {
            console.log(`Course: "${c.title}" | ID: ${c._id}`);
            console.log(`   Instructor: ${c.instructor}`);
            if (!c.instructor) console.log('   [WARNING] MISSING INSTRUCTOR');
        });

        console.log('\n--- Checking Recent Notifications ---');
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
        if (notifications.length === 0) console.log('No notifications found.');
        notifications.forEach(n => {
            console.log(`Notif: "${n.message}" | To: ${n.recipient} | Type: ${n.onModel} | Time: ${n.createdAt}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugData();
