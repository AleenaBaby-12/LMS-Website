const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config({ path: './server/.env' });

const debugThumbnailTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const courses = await Course.find({}, 'title thumbnail');
        courses.forEach(c => {
            const type = typeof c.thumbnail;
            console.log(`Title: ${c.title}, Thumbnail Type: ${type}, Value: '${c.thumbnail}'`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugThumbnailTypes();
