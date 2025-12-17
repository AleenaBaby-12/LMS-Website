const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateRole = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: node server/scripts/set_role_teacher.js <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }

        user.role = 'teacher';

        // Add default instructor fields if missing
        if (!user.professionalTitle) user.professionalTitle = 'Instructor';
        if (!user.organization) user.organization = 'LMS Learning';
        if (!user.website) user.website = 'https://example.com';
        if (!user.linkedIn) user.linkedIn = 'https://linkedin.com';
        if (!user.qualifications) user.qualifications = 'Certified Instructor';

        await user.save();

        console.log(`SUCCESS: User ${user.name} (${user.email}) is now a TEACHER.`);
        console.log('You can now log in and access the Teacher Dashboard.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

updateRole();
