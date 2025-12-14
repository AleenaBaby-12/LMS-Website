const express = require('express');
const router = express.Router();
const { createOrUpdateReview, getCourseReviews, getMyReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public route - anyone can view reviews
router.get('/:courseId', getCourseReviews);

// Protected routes
router.post('/:courseId', protect, createOrUpdateReview);
router.get('/:courseId/my-review', protect, getMyReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
