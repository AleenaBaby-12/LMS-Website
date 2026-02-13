const express = require('express');
const router = express.Router();
const { getMyAchievements, getLeaderboard } = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-achievements', protect, getMyAchievements);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
