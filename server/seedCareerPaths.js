const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CareerPath = require('./models/CareerPath');
const Course = require('./models/Course');

dotenv.config();

const seedCareerPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing paths to avoid duplicates during dev
        await CareerPath.deleteMany({});
        console.log('Cleared existing career paths');

        // Fetch existing courses to link
        const frontendCourse = await Course.findOne({ title: /Frontend/i });
        const backendCourse = await Course.findOne({ title: /Backend/i });
        const fullstackCourse = await Course.findOne({ title: /Full Stack/i });
        const devopsCourse = await Course.findOne({ title: /DevOps/i });

        const careerPaths = [
            {
                title: "Frontend Developer",
                description: "Build beautiful, interactive user interfaces for the web using modern libraries like React.",
                skills: ["HTML", "CSS", "JavaScript", "React", "Redux", "Tailwind CSS"],
                salaryRange: "$70,000 - $110,000",
                jobRoles: ["Frontend Engineer", "UI Developer", "Web Designer"],
                courses: frontendCourse ? [frontendCourse._id] : [],
                icon: "Monitor"
            },
            {
                title: "Backend Engineer",
                description: "Design robust APIs, manage databases, and ensure server-side performance.",
                skills: ["Node.js", "Express", "MongoDB", "SQL", "API Design", "Authentication"],
                salaryRange: "$80,000 - $120,000",
                jobRoles: ["Backend Developer", "API Engineer", "Database Administrator"],
                courses: backendCourse ? [backendCourse._id] : [],
                icon: "Server"
            },
            {
                title: "Full Stack Developer",
                description: "Master both client-side and server-side development to build complete applications.",
                skills: ["MERN Stack", "System Design", "Cloud Deployment", "Testing"],
                salaryRange: "$90,000 - $130,000",
                jobRoles: ["Full Stack Engineer", "Software Architect", "Technical Lead"],
                courses: fullstackCourse ? [fullstackCourse._id] : [],
                icon: "Layers"
            },
            {
                title: "DevOps Engineer",
                description: "Streamline development operations with CI/CD, cloud infrastructure, and automation.",
                skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
                salaryRange: "$100,000 - $140,000",
                jobRoles: ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"],
                courses: devopsCourse ? [devopsCourse._id] : [],
                icon: "Cloud"
            }
        ];

        await CareerPath.insertMany(careerPaths);
        console.log('Seeded career paths successfully!');

        // Update courses with tags
        if (frontendCourse) {
            frontendCourse.careerPathTags = ["Frontend", "Web Development"];
            await frontendCourse.save();
        }
        if (backendCourse) {
            backendCourse.careerPathTags = ["Backend", "API"];
            await backendCourse.save();
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding career paths:', error);
        process.exit(1);
    }
};

seedCareerPaths();
