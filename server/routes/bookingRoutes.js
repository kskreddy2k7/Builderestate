const express = require('express');
const router = express.Router();
const { createBooking, getBuyerBookings, getBuilderBookings, updateBookingStatus, createPayment } = require('../controllers/bookingController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.post('/', authMiddleware, checkRole(['BUYER']), createBooking);
router.get('/buyer', authMiddleware, checkRole(['BUYER']), getBuyerBookings);
router.get('/builder', authMiddleware, checkRole(['BUILDER']), getBuilderBookings);
router.put('/:id/status', authMiddleware, checkRole(['BUILDER', 'ADMIN']), updateBookingStatus);
router.post('/pay', authMiddleware, checkRole(['BUYER']), createPayment);

module.exports = router;
