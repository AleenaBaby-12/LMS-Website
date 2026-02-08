const Stripe = require('stripe');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { createNotification } = require('./notificationController');

const stripe = process.env.STRIPE_SECRET_KEY
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

if (!stripe) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing from .env. Payment features will not work.");
}

const createCheckoutSession = async (req, res) => {
    console.log('--- Create Checkout Session Request ---');
    console.log('User ID:', req.user ? req.user._id : 'No User');

    if (!stripe) {
        console.error('Stripe is not initialized in controller');
        return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    try {
        const { courseId } = req.body;
        console.log('Course ID:', courseId);

        const course = await Course.findById(courseId);

        if (!course) {
            console.error('Course not found:', courseId);
            return res.status(404).json({ message: 'Course not found' });
        }

        console.log('Course found:', course.title, 'Price:', course.price);

        // Stripe requires absolute URLs for images. If it's a relative path, don't send it.
        const imageUrls = [];
        if (course.thumbnail) {
            if (course.thumbnail.startsWith('http')) {
                imageUrls.push(course.thumbnail);
            } else if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost')) {
                // Only prepend if we have a production-like URL
                imageUrls.push(`${process.env.CLIENT_URL}${course.thumbnail}`);
            }
        }

        if (!req.user || !req.user.email) {
            console.error('User email missing for payment session');
            return res.status(400).json({
                message: 'User email is required for payment',
                error: 'Your profile is missing an email address. Please update your profile.'
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email, // Often required for Indian exports/compliance
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: course.title || 'Course Enrollment',
                            description: course.description || 'Access to course content',
                            images: imageUrls,
                        },
                        unit_amount: Math.round((course.price || 0) * 100), // Stripe expects paise (cents)
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
            payment_intent_data: {
                description: `Enrollment in course: ${course.title}`,
            },
            locale: 'auto',
            billing_address_collection: 'required',
            custom_text: {
                submit: {
                    message: 'Transaction will be processed in Indian Rupees (INR).',
                },
            },
        });

        console.log('Stripe Session Created Successfully:', session.id);
        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('--- STRIPE SESSION CREATION FAILED ---');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        res.status(500).json({
            message: 'Payment session creation failed',
            error: error.message,
            stripe_error_code: error.code,
            details: error.raw?.message || null
        });
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

            // Add to course student list and fetch instructor
            const course = await Course.findByIdAndUpdate(
                courseId,
                { $addToSet: { studentsEnrolled: req.user._id } },
                { new: true }
            ).populate('instructor');

            // --- Notifications ---

            // 1. Notify Student
            await createNotification({
                recipient: req.user._id,
                message: `Purchase successful! You have been enrolled in ${course.title}`,
                type: 'success',
                relatedId: course._id,
                onModel: 'Course'
            });

            // 2. Notify Instructor
            if (course.instructor) {
                await createNotification({
                    recipient: course.instructor._id || course.instructor, // Handle if populated or ID
                    message: `New student enrolled in ${course.title} (Paid): ${req.user.name}`,
                    type: 'info',
                    relatedId: course._id,
                    onModel: 'Course'
                });
            }

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
