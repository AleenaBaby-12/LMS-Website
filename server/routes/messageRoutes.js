const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversation,
    markConversationRead,
    getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/unread/count', getUnreadCount);
router.get('/:userId', getConversation);
router.put('/mark-conversation-read/:userId', markConversationRead);

module.exports = router;
