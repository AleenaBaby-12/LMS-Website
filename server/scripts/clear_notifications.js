const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await Notification.deleteMany({});
        console.log(`Deleted ${result.deletedCount} notifications.`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

clearNotifications();
