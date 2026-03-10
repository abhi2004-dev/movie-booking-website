const express    = require('express');
const router     = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// ─── IMPORTANT: specific routes BEFORE /:id ───────────────────────────────
router.get('/seats/:showtimeId', bookingController.getSeatAvailability);
router.post('/lock',             protect, bookingController.lockSeats);
router.get('/',                  protect, bookingController.getUserBookings);
router.post('/',                 protect, bookingController.createBooking);
router.get('/:id',               protect, bookingController.getBooking);
router.put('/:id/cancel',        protect, bookingController.cancelBooking);

module.exports = router;