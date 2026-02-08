const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { createNotification } = require('../controllers/notificationController');

dotenv.config({ path: path.join(__dirname, '../.env') });

const simulateEnrollment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a course with an instructor
        const course = await Course.findOne().populate('instructor');
        if (!course) {
            console.log('No courses found');
            process.exit();
        }

        console.log(`Course Found: ${course.title}`);
        console.log(`Instructor: ${course.instructor ? course.instructor._id : 'NONE'}`);

        if (!course.instructor) {
            // Force assign a random user as instructor if missing
            const user = await User.findOne({ role: 'teacher' });
            if (user) {
                course.instructor = user._id;
                await course.save();
                console.log(`Assigned instructor: ${user._id}`);
            } else {
                console.log('No teachers found to assign');
            }
        }

        // Simulate notification
        if (course.instructor) {
            console.log(`Attempting to notify instructor: ${course.instructor._id || course.instructor}`);
            const result = await createNotification({
                recipient: course.instructor._id || course.instructor,
                message: `DEBUG: Fake student enrolled in ${course.title}`,
                type: 'info',
                relatedId: course._id,
                onModel: 'Course'
            });
            console.log('Notification Result:', result);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

simulateEnrollment();
