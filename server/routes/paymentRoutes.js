const express = require('express');
const { createCheckoutSession, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;
