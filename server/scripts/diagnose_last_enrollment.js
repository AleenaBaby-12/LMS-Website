const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get latest enrollment
        const enrollment = await Enrollment.findOne()
            .sort({ createdAt: -1 })
            .populate('student')
            .populate('course');

        if (!enrollment) {
            console.log('No enrollments found at all.');
            process.exit();
        }

        console.log('--- LATEST ENROLLMENT DIAGNOSIS ---');
        console.log(`Time: ${enrollment.createdAt}`);
        console.log(`Student: ${enrollment.student.name} (${enrollment.student._id})`);
        console.log(`Course: ${enrollment.course.title} (${enrollment.course._id})`);

        // 2. Check Instructor
        const course = await Course.findById(enrollment.course._id).populate('instructor');
        console.log(`Instructor: ${course.instructor ? course.instructor.name : 'NONE'} (${course.instructor ? course.instructor._id : 'N/A'})`);

        if (!course.instructor) {
            console.log('❌ FAILURE: Course has no instructor.');
            process.exit();
        }

        // 3. Find Notification for this Instructor
        // Look for notifications created AFTER the enrollment time (minus small buffer)
        const timeBuffer = new Date(enrollment.createdAt.getTime() - 5000); // 5 seconds before

        const notification = await Notification.findOne({
            recipient: course.instructor._id,
            onModel: 'Course',
            relatedId: course._id,
            createdAt: { $gt: timeBuffer }
        });

        if (notification) {
            console.log('✅ SUCCESS: Notification found!');
            console.log(`   Message: "${notification.message}"`);
            console.log(`   To User: ${notification.recipient}`);
            console.log(`   Is Read: ${notification.isRead}`);
        } else {
            console.log('❌ FAILURE: No notification found for this event.');
            console.log('   Checking recent notifications for this user anyway:');
            const recent = await Notification.find({ recipient: course.instructor._id }).sort({ createdAt: -1 }).limit(3);
            recent.forEach(n => console.log(`   - ${n.message} (${n.createdAt})`));
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

diagnose();
