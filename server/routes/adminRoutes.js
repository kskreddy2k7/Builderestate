const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.get('/stats', authMiddleware, checkRole(['ADMIN']), getDashboardStats);
router.get('/users', authMiddleware, checkRole(['ADMIN']), getAllUsers);
router.delete('/users/:id', authMiddleware, checkRole(['ADMIN']), deleteUser);

module.exports = router;
