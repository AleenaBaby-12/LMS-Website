const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createAssignment,
    getAssignmentsByCourse,
    getMyAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignmentController');

// Public/Protected
router.get('/my-assignments', protect, getMyAssignments);
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post('/:id/submit', protect, submitAssignment);

// Teacher/Admin only
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), getAssignmentSubmissions);
router.put('/submission/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

module.exports = router;
