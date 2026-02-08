const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course'); // Need to remove student from course list too

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetLastEnrollment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get latest enrollment
        const enrollment = await Enrollment.findOne().sort({ createdAt: -1 });

        if (!enrollment) {
            console.log('No enrollment found to reset.');
            process.exit();
        }

        console.log(`Deleting Enrollment ID: ${enrollment._id} (User: ${enrollment.student} -> Course: ${enrollment.course})`);

        // 2. Remove from Course studentsEnrolled array
        await Course.updateOne(
            { _id: enrollment.course },
            { $pull: { studentsEnrolled: enrollment.student } }
        );
        console.log('Removed student from Course enrollment list.');

        // 3. Delete the enrollment
        await Enrollment.deleteOne({ _id: enrollment._id });
        console.log('Enrollment deleted.');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetLastEnrollment();
