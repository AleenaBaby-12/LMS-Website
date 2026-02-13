const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course'); // Required for populate
const { issueCertificate, issueBadge } = require('./controllers/gamificationController');

dotenv.config();

const migrateCertificates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all enrollments that are 100% complete OR marked as completed
        const completedEnrollments = await Enrollment.find({
            $or: [
                { progress: 100 },
                { completed: true }
            ]
        }).populate('course');

        console.log(`Found ${completedEnrollments.length} completed enrollments to process.`);

        for (const enrollment of completedEnrollments) {
            console.log(`Processing student ${enrollment.student} for course ${enrollment.course.title}...`);

            // 1. Ensure 'completed' flag is true
            if (!enrollment.completed) {
                enrollment.completed = true;
                await enrollment.save();
                console.log(`- Marked as completed.`);
            }

            // 2. Issue Certificate and Course Finisher Badge
            // The gamification controller handles idempotency (won't issue duplicates)
            const cert = await issueCertificate(enrollment.student, enrollment.course._id);
            if (cert) {
                console.log(`- Certificate ensured: ${cert.serialNumber}`);
            } else {
                console.log(`- Certificate check failed.`);
            }

            // 3. Issue 'Master Graduate' badge explicitly if not handled by issueCertificate
            // issueCertificate calls issueBadge('course_completion'), so it should be covered.
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateCertificates();
