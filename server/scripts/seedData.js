const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Review = require('../models/Review');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Assignment.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data.');

        // 1. Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@lms.com',
            password: 'adminpassword123',
            role: 'admin'
        });
        console.log('Admin created.');

        // 2. Create Teachers
        const teacher1 = await User.create({
            name: 'Dr. Sarah Wilson',
            email: 'sarah@teacher.com',
            password: 'password123',
            role: 'teacher',
            professionalTitle: 'Senior Web Developer',
            organization: 'Tech Academy',
            bio: 'Passionate about teaching modern web technologies.'
        });

        const teacher2 = await User.create({
            name: 'Prof. James Miller',
            email: 'james@teacher.com',
            password: 'password123',
            role: 'teacher',
            professionalTitle: 'Data Scientist',
            organization: 'AI University',
            bio: 'Expert in Python and Machine Learning.'
        });
        console.log('Teachers created.');

        // 3. Create Students
        const students = await User.create([
            { name: 'Alice Johnson', email: 'alice@student.com', password: 'password123', role: 'student' },
            { name: 'Bob Smith', email: 'bob@student.com', password: 'password123', role: 'student' },
            { name: 'Charlie Davis', email: 'charlie@student.com', password: 'password123', role: 'student' }
        ]);
        console.log('Students created.');

        // 4. Create Courses
        const course1 = await Course.create({
            title: 'Full Stack Web Development',
            description: 'Learn MERN stack from scratch with hands-on projects.',
            instructor: teacher1._id,
            price: 99.99,
            isPublished: true,
            modules: [
                {
                    title: 'Introduction to HTML & CSS',
                    lessons: [
                        { title: 'HTML Basics', content: 'Tags and attributes...', isFree: true },
                        { title: 'CSS Layouts', content: 'Flexbox and Grid...' }
                    ]
                },
                {
                    title: 'React.js Fundamentals',
                    lessons: [
                        { title: 'Components & Props', content: 'Building blocks of React...' },
                        { title: 'State & Hooks', content: 'Handling data...' }
                    ]
                }
            ]
        });

        const course2 = await Course.create({
            title: 'Python for Data Science',
            description: 'Master Python libraries like Pandas and Scikit-learn.',
            instructor: teacher2._id,
            price: 149.99,
            isPublished: true,
            modules: [
                {
                    title: 'Python Basics',
                    lessons: [
                        { title: 'Variables & Loops', content: 'Getting started...', isFree: true }
                    ]
                }
            ]
        });
        console.log('Courses created.');

        // 5. Create Enrollments
        await Enrollment.create([
            { student: students[0]._id, course: course1._id, progress: 25 },
            { student: students[1]._id, course: course1._id, progress: 50 },
            { student: students[2]._id, course: course2._id, progress: 10 }
        ]);

        // Update Course's studentsEnrolled array
        await Course.findByIdAndUpdate(course1._id, { $push: { studentsEnrolled: { $each: [students[0]._id, students[1]._id] } } });
        await Course.findByIdAndUpdate(course2._id, { $push: { studentsEnrolled: students[2]._id } });
        console.log('Enrollments created.');

        // 6. Create Assignments
        await Assignment.create({
            title: 'React Personal Portfolio',
            description: 'Build your own portfolio using React and post the link.',
            course: course1._id,
            createdBy: teacher1._id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            points: 100
        });
        console.log('Assignments created.');

        // 7. Create Reviews
        await Review.create({
            course: course1._id,
            student: students[1]._id,
            rating: 5,
            comment: 'Excellent course! Everything is explained very clearly.'
        });

        // Update Course rating
        await Course.findByIdAndUpdate(course1._id, { averageRating: 5, totalReviews: 1 });
        console.log('Reviews created.');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
