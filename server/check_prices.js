const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('./models/Course');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses:`);

        courses.forEach(c => {
            console.log(`- Title: ${c.title}`);
            console.log(`  Price: ${c.price}`);
            console.log(`  Rating: ${c.averageRating}`);
            console.log('---');
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCourses();
