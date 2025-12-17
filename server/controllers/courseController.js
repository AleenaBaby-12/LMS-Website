const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        // Filter by published unless admin query is present
        const query = req.query.admin === 'true' ? {} : { isPublished: true };
        const courses = await Course.find(query).populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses created by current teacher
// @route   GET /api/courses/mine
// @access  Private/Teacher
const getMyCreatedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .populate('instructor', 'name')
            .populate('studentsEnrolled', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name')
            .populate('studentsEnrolled', 'name'); // Optional: limit this based on role

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Teacher/Admin
const createCourse = async (req, res) => {
    try {
        console.log('Create Course Request:', req.body);
        console.log('User creating course:', req.user._id);

        const { title, description, thumbnail, price } = req.body;
        const course = new Course({
            title,
            description,
            thumbnail,
            price,
            instructor: req.user._id,
            modules: []
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Teacher/Admin
const updateCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, price, modules, isPublished } = req.body;
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this course' });
            }

            course.title = title || course.title;
            course.description = description || course.description;
            course.thumbnail = thumbnail || course.thumbnail;
            course.price = price !== undefined ? price : course.price;
            course.modules = modules || course.modules;
            course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this course' });
            }

            await course.deleteOne();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getMyCreatedCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
