const Stripe = require('stripe');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const stripe = process.env.STRIPE_SECRET_KEY
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

if (!stripe) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing from .env. Payment features will not work.");
}

const createCheckoutSession = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.title,
                            description: course.description,
                            images: course.thumbnail ? [course.thumbnail] : [],
                        },
                        unit_amount: Math.round(course.price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/courses/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: req.user._id.toString(),
            },
        });

        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ message: 'Payment session creation failed', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    try {
        const { sessionId, courseId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Check if already enrolled
            const existingEnrollment = await Enrollment.findOne({
                student: req.user._id,
                course: courseId
            });

            if (existingEnrollment) {
                return res.json({ message: 'Already enrolled' });
            }

            // Enroll user
            await Enrollment.create({
                student: req.user._id,
                course: courseId
            });

            // Add to course student list
            await Course.findByIdAndUpdate(courseId, {
                $addToSet: { studentsEnrolled: req.user._id }
            });

            res.json({ success: true, message: 'Payment verified and enrolled' });
        } else {
            res.status(400).json({ message: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};

module.exports = { createCheckoutSession, verifyPayment };
