const express = require('express');

const verifyToken = require('../middlewares/verifyToken');
const bookingController = require('../controllers/booking-controller');

const router = express.Router();

router.get('/bookings', verifyToken, bookingController.get_bookings);
router.get(
  '/bookings/:booking_id',
  verifyToken,
  bookingController.get_booking_id,
);
router.post('/bookings', verifyToken, bookingController.post_booking);

module.exports = router;
