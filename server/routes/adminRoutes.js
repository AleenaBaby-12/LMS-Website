const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    deleteUser,
    getPendingCourses,
    updateCourseApproval,
    sendBroadcast,
    getSettings,
    updateSettings,
    getAllCourses,
    getSalesHistory,
    resetUserPassword
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here are protected and require Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleUserBlock);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.get('/courses', getAllCourses);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', updateCourseApproval);
router.post('/broadcast', sendBroadcast);
router.get('/settings', getSettings);
router.get('/sales', getSalesHistory);
router.put('/settings', updateSettings);

module.exports = router;
