const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const main = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const teachers = await User.find({ role: 'teacher' }, 'name email role');
    console.log('Teachers found:', teachers.length);
    teachers.forEach(t => console.log(`- ${t.name} (${t.email})`));

    const mentors = await User.find({ isMentor: true }, 'name email');
    console.log('\nManual mentors:', mentors.length);
    mentors.forEach(m => console.log(`- ${m.name} (${m.email})`));

    mongoose.connection.close();
};

main();
