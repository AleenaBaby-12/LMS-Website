const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCareerPaths, setCareerGoal, getCareerDashboard } = require('../controllers/careerController');

router.get('/paths', getCareerPaths);
router.post('/goal', protect, setCareerGoal);
router.get('/dashboard', protect, getCareerDashboard);

module.exports = router;
