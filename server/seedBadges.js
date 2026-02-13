const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('./models/Badge');

dotenv.config();

const seedBadges = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const initialBadges = [
            {
                title: 'Curtain Raiser',
                description: 'Completed your first module!',
                criteriaType: 'module_completion',
                icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
                points: 20
            },
            {
                title: 'Master Graduate',
                description: 'Successfully completed an entire course.',
                criteriaType: 'course_completion',
                icon: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
                points: 100
            },
            {
                title: 'High Achiever',
                description: 'Scored 90% or higher on an assignment.',
                criteriaType: 'score',
                icon: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png',
                points: 50
            },
            {
                title: 'Top Contributor',
                description: 'Actively participating in course assignments.',
                criteriaType: 'engagement',
                icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png',
                points: 30
            }
        ];

        for (const b of initialBadges) {
            await Badge.findOneAndUpdate(
                { title: b.title },
                b,
                { upsert: true, new: true }
            );
        }

        console.log('Badges seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedBadges();
