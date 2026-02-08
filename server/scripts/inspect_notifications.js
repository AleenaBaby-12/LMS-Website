const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const inspectNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(5);

        console.log('Latest 5 Notifications:');
        notifications.forEach(n => {
            console.log('------------------------------------------------');
            console.log(`ID: ${n._id}`);
            console.log(`Message: ${n.message}`);
            console.log(`Type: ${n.type}`);
            console.log(`onModel: '${n.onModel}'`);
            console.log(`relatedId: ${n.relatedId}`);
            console.log(`IsRead: ${n.isRead}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectNotifications();
