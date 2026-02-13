const express = require('express');
const { getMentors } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMentors);

module.exports = router;
