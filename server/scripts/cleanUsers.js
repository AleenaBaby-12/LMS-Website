const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const seededEmails = [
            'admin@lms.com',
            'sarah@teacher.com',
            'james@teacher.com',
            'alice@student.com',
            'bob@student.com',
            'charlie@student.com'
        ];

        // Find all users not in the seeded list
        const invalidUsers = await User.find({ email: { $nin: seededEmails } });
        console.log(`Found ${invalidUsers.length} users to remove.`);

        if (invalidUsers.length > 0) {
            const result = await User.deleteMany({ email: { $nin: seededEmails } });
            console.log(`Removed ${result.deletedCount} users.`);
        }

        process.exit();
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanUsers();
