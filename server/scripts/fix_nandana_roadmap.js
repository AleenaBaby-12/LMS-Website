const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course');
const CareerPath = require('../models/CareerPath');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const courseId = '69885f34cea33705c7f41a6f'; // MERN Stack full course
    const cpId = '6988b8c3de8b5866c9526508'; // Backend Engineer

    // Add course to career path
    await CareerPath.findByIdAndUpdate(cpId, { $addToSet: { courses: courseId } });

    // Add tag to course
    await Course.findByIdAndUpdate(courseId, { $addToSet: { careerPathTags: 'Backend' } });

    console.log('Career Path and Course updated successfully.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
