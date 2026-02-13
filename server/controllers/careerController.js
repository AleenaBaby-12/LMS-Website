const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all available career paths
// @route   GET /api/career/paths
// @access  Public
const getCareerPaths = async (req, res) => {
    try {
        const paths = await CareerPath.find({}).populate('courses', 'title thumbnail');
        res.json(paths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set user's career goal
// @route   POST /api/career/goal
// @access  Private
const setCareerGoal = async (req, res) => {
    try {
        const { careerPathId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.careerGoal = careerPathId;
        await user.save();

        res.json({ message: 'Career goal updated', careerGoal: careerPathId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Career Dashboard Data (Readiness, Roadmap, Jobs)
// @route   GET /api/career/dashboard
// @access  Private
const getCareerDashboard = async (req, res) => {
    try {
        // 1. Fetch User and Enrollments
        const [user, enrollments] = await Promise.all([
            User.findById(req.user._id),
            Enrollment.find({
                student: req.user._id,
                completed: true
            }).populate({
                path: 'course',
                select: 'title thumbnail careerPathTags'
            })
        ]);

        let careerPath = null;
        let isManualGoal = false;

        // 2. Check for Manual Goal First
        if (user.careerGoal) {
            careerPath = await CareerPath.findById(user.careerGoal).populate('courses');
            if (careerPath) isManualGoal = true;
        }

        // 3. Fallback to Auto-Detection if no manual goal OR if they have enrollments but no manual goal
        if (!careerPath && enrollments.length > 0) {
            const tagCounts = {};
            enrollments.forEach(en => {
                if (en.course && en.course.careerPathTags) {
                    en.course.careerPathTags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });

            const topTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b, null);
            if (topTag) {
                careerPath = await CareerPath.findOne({
                    $or: [
                        { title: { $regex: topTag, $options: 'i' } },
                        { skills: { $in: [topTag] } }
                    ]
                }).populate('courses');
            }
        }

        // 4. Handle Case: No goal set and no courses completed
        if (!careerPath) {
            return res.json({
                hasGoal: false,
                message: "Select a career path or complete a course to unlock your roadmap!"
            });
        }

        // 3. Calculate Readiness Score based on the INFERRED path
        // Logic: (Completed Career Courses / Total Career Courses) * 100
        const careerCourseIds = careerPath.courses.map(c => c._id.toString());

        // Re-fetch enrollments specifically for this path to be precise, or filter existing list
        const completedCareerCourses = enrollments.filter(e =>
            e.course && careerCourseIds.includes(e.course._id.toString())
        );

        const completedCount = completedCareerCourses.length;
        const totalCount = careerPath.courses.length;
        const readinessScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Mock Job Recommendations based on Career Path
        // In production, this would call LinkedIn API
        const mockJobs = [
            {
                id: 1,
                title: `Junior ${careerPath.title}`,
                company: "Tech Solutions Inc.",
                location: "Remote",
                salary: "$60k - $80k",
                link: "#"
            },
            {
                id: 2,
                title: `${careerPath.title} Intern`,
                company: "Startup Galaxy",
                location: "New York, NY",
                salary: "$40/hr",
                link: "#"
            },
            {
                id: 3,
                title: `Associate ${careerPath.jobRoles[0]}`,
                company: "Global Corp",
                location: "London, UK",
                salary: "£45k - £60k",
                link: "#"
            }
        ];

        // Roadmap Data
        const roadmap = careerPath.courses.map(course => {
            const isCompleted = enrollments.some(e => e.course && e.course._id.toString() === course._id.toString());
            return {
                courseId: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                status: isCompleted ? 'completed' : 'pending'
            };
        });

        res.json({
            hasGoal: true,
            inferredPath: true, // Flag to tell UI this was auto-detected
            careerPath: careerPath.title,
            description: careerPath.description,
            salaryRange: careerPath.salaryRange,
            readinessScore,
            roadmap,
            jobs: mockJobs,
            skills: careerPath.skills
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCareerPaths,
    setCareerGoal,
    getCareerDashboard
};
