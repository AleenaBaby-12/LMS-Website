const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/', protect, authorize('teacher', 'admin'), upload.single('file'), uploadFile);
router.post('/profile-picture', upload.single('file'), uploadFile); // Made public to allow registration-time uploads

module.exports = router;
