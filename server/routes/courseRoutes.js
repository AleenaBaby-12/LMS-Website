const express = require('express');
const router = express.Router();
const {
    getCourses,
    getMyCreatedCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, authorize('teacher', 'admin'), createCourse);

router.get('/mine', protect, authorize('teacher', 'admin'), getMyCreatedCourses);

router.route('/:id')
    .get(getCourseById)
    .put(protect, authorize('teacher', 'admin'), updateCourse)
    .delete(protect, authorize('teacher', 'admin'), deleteCourse);

module.exports = router;
