const express = require('express');
const {
    sendConnectionRequest,
    respondToRequest,
    getMyConnections,
    getPendingRequests,
    getConnectionStatus,
    getMentorContact
} = require('../controllers/mentorConnectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request', protect, sendConnectionRequest);
router.put('/:id/respond', protect, respondToRequest);
router.get('/my-connections', protect, getMyConnections);
router.get('/pending', protect, getPendingRequests);
router.get('/status/:mentorId', protect, getConnectionStatus);
router.get('/:id/contact', protect, getMentorContact);

module.exports = router;
