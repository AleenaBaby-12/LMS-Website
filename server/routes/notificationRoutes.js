const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

// router.use(protect); // Protect all routes (uncomment if using globally here, but typically protected in index or individually)
router.use(protect);

router.get('/', getUserNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/test', require('../controllers/notificationController').sendTestNotification);

module.exports = router;
