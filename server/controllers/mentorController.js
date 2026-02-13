const User = require('../models/User');
const CareerPath = require('../models/CareerPath');

// @desc    Get mentors for a specific career path
// @route   GET /api/mentors?careerPath=Frontend Developer
// @access  Private
const getMentors = async (req, res) => {
    try {
        // Build query: find users who are mentors OR teachers (instructors are auto-mentors)
        let query = {
            $or: [
                { isMentor: true },
                { role: 'teacher' }
            ]
        };

        const mentors = await User.find(query)
            .select('name email profilePicture bio mentorBio careerGoal role qualifications professionalTitle organization website linkedIn')
            .populate('careerGoal', 'title')
            .limit(20);

        res.json(mentors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMentors
};
