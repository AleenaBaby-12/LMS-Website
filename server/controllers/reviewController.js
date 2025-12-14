const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Create or update a review
// @route   POST /api/reviews/:courseId
// @access  Private/Student
const createOrUpdateReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;

        // Check if student is enrolled and completed the course
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You must be enrolled in this course to review it' });
        }

        if (enrollment.progress !== 100) {
            return res.status(403).json({ message: 'You must complete the course (100% progress) before reviewing' });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Create or update review
        let review = await Review.findOne({
            course: courseId,
            student: req.user._id
        });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment || '';
            await review.save();
        } else {
            // Create new review
            review = await Review.create({
                course: courseId,
                student: req.user._id,
                rating,
                comment: comment || ''
            });
        }

        // Recalculate course average rating
        await updateCourseRating(courseId);

        res.json(review);
    } catch (error) {
        console.error('Create/Update review error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.find({ course: courseId })
            .populate('student', 'name')
            .sort({ createdAt: -1 }); // Most recent first

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my review for a course
// @route   GET /api/reviews/:courseId/my-review
// @access  Private
const getMyReview = async (req, res) => {
    try {
        const { courseId } = req.params;

        const review = await Review.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!review) {
            return res.status(404).json({ message: 'No review found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const courseId = review.course;
        await review.deleteOne();

        // Recalculate course average rating
        await updateCourseRating(courseId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update course rating
const updateCourseRating = async (courseId) => {
    try {
        const reviews = await Review.find({ course: courseId });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        await Course.findByIdAndUpdate(courseId, {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews
        });
    } catch (error) {
        console.error('Error updating course rating:', error);
    }
};

module.exports = {
    createOrUpdateReview,
    getCourseReviews,
    getMyReview,
    deleteReview
};
