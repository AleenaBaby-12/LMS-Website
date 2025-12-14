const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/', protect, authorize('teacher', 'admin'), upload.single('file'), uploadFile);
router.post('/profile-picture', protect, upload.single('file'), uploadFile); // Profile picture upload for all users

module.exports = router;
