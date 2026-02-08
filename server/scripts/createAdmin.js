const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin user already exists:', adminExists.email);
            console.log('Removing existing admin as requested...');
            await User.deleteOne({ _id: adminExists._id });
        }

        const adminUser = {
            name: 'System Admin',
            email: 'admin@lms.com',
            password: 'adminpassword123', // This will be hashed by the User model's pre-save hook
            role: 'admin'
        };

        const user = await User.create(adminUser);

        if (user) {
            console.log('Admin User Created Successfully!');
            console.log('Email: admin@lms.com');
            console.log('Password: adminpassword123');
            console.log('Please change the password after logging in.');
        }

        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
