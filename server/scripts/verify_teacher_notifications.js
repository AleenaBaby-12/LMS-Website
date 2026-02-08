const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyTeacherNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the teacher (using the ID from previous logs or just the first teacher)
        // The ID from logs was 692aada4952a521c3fb69b7f
        const teacher = await User.findOne({ role: 'teacher' });

        if (!teacher) {
            console.log('No teacher found!');
            process.exit();
        }

        console.log(`Checking notifications for Teacher: ${teacher.name} (${teacher._id})`);

        // 2. Fetch notifications exactly like the controller does
        const notifications = await Notification.find({ recipient: teacher._id })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`Found ${notifications.length} notifications.`);
        notifications.forEach(n => {
            console.log(`- [${n.onModel}][${n.type}] ${n.message} (Read: ${n.isRead})`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyTeacherNotifications();
