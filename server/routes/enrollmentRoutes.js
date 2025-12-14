const express = require('express');
const router = express.Router();
const { enrollCourse, getMyCourses, updateProgress, toggleLessonComplete, getCourseProgress } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, enrollCourse);
router.get('/my-courses', protect, getMyCourses);
router.put('/:id/progress', protect, updateProgress);

// New progress tracking routes
router.post('/:courseId/lesson/toggle', protect, toggleLessonComplete);
router.get('/:courseId/progress', protect, getCourseProgress);

module.exports = router;
