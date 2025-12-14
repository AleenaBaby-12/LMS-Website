const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const enrollmentExists = await Enrollment.findOne({
            student: req.user._id,
            course: courseId
        });

        if (enrollmentExists) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: courseId
        });

        // Add student to course's student list
        course.studentsEnrolled.push(req.user._id);
        await course.save();

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private
const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update progress (mark lesson complete)
// @route   PUT /api/enrollments/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { lessonId, totalLessons } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        if (enrollment.student.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
        }

        if (totalLessons > 0) {
            enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
        }

        if (enrollment.progress === 100) {
            enrollment.completed = true;
        }

        await enrollment.save();
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark lesson as complete/incomplete (toggle)
// @route   POST /api/enrollments/:courseId/lesson/toggle
// @access  Private/Student
const toggleLessonComplete = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId } = req.body; // Format: "moduleIndex-lessonIndex" e.g. "0-1"

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId
        }).populate('course');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Toggle lesson completion
        const lessonIndex = enrollment.completedLessons.indexOf(lessonId);
        if (lessonIndex > -1) {
            // Remove if already completed
            enrollment.completedLessons.splice(lessonIndex, 1);
        } else {
            // Add if not completed
            enrollment.completedLessons.push(lessonId);
        }

        // Calculate total lessons in course
        let totalLessons = 0;
        if (enrollment.course && enrollment.course.modules) {
            enrollment.course.modules.forEach(module => {
                totalLessons += module.lessons ? module.lessons.length : 0;
            });
        }

        // Update progress percentage
        if (totalLessons > 0) {
            enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
        }

        // Mark as completed if 100%
        enrollment.completed = enrollment.progress === 100;

        // Update last accessed
        enrollment.lastAccessed = new Date();

        await enrollment.save();

        res.json({
            completedLessons: enrollment.completedLessons,
            progress: enrollment.progress,
            completed: enrollment.completed,
            totalLessons,
            completedCount: enrollment.completedLessons.length
        });
    } catch (error) {
        console.error('Toggle lesson error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed progress for a course
// @route   GET /api/enrollments/:courseId/progress
// @access  Private/Student
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId
        }).populate('course');

        if (!enrollment) {
            return res.status(404).json({ message: 'Not enrolled in this course' });
        }

        // Calculate total lessons
        let totalLessons = 0;
        if (enrollment.course && enrollment.course.modules) {
            enrollment.course.modules.forEach(module => {
                totalLessons += module.lessons ? module.lessons.length : 0;
            });
        }

        res.json({
            completedLessons: enrollment.completedLessons,
            progress: enrollment.progress,
            completed: enrollment.completed,
            totalLessons,
            completedCount: enrollment.completedLessons.length,
            lastAccessed: enrollment.lastAccessed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollCourse,
    getMyCourses,
    updateProgress,
    toggleLessonComplete,
    getCourseProgress
}
