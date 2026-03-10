const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');
const { unlockMultipleSeats } = require('../config/redis');

// ─── INIT RAZORPAY ────────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ error: 'Amount and bookingId are required' });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending state' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // convert to paise
      currency,
      receipt:  `receipt_${bookingId.slice(0, 8)}`,
      notes: {
        booking_id: bookingId,
        user_id:    req.user.id,
      },
    });

    res.json({
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      key_id:     process.env.RAZORPAY_KEY_ID,
      booking_id: bookingId,
    });

  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ error: 'All payment fields are required' });
    }

    // Verify signature
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch booking to get seats + showtime
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Confirm booking in DB
    const confirmed = await Booking.confirm(bookingId, razorpay_payment_id);

    // Unlock Redis locks (seats are now permanently booked in DB)
    await unlockMultipleSeats(booking.showtime_id, booking.seats);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`showtime_${booking.showtime_id}`).emit('seats_confirmed', {
        showtime_id: booking.showtime_id,
        seats:       booking.seats,
        status:      'booked',
      });
    }

    res.json({
      message:    'Payment verified successfully',
      booking_id: bookingId,
      payment_id: razorpay_payment_id,
      booking:    confirmed,
    });

  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// ─── PAYMENT FAILED ───────────────────────────────────────────────────────────
const paymentFailed = async (req, res) => {
  try {
    const { bookingId, seatCodes, showtimeId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    // Cancel the pending booking
    await Booking.cancel(bookingId);

    // Unlock seats in Redis
    if (seatCodes && showtimeId) {
      await unlockMultipleSeats(showtimeId, seatCodes);
    }

    // Notify other users those seats are free again
    const io = req.app.get('io');
    if (io && showtimeId && seatCodes) {
      io.to(`showtime_${showtimeId}`).emit('seats_unlocked', {
        showtime_id: showtimeId,
        seats:       seatCodes,
        status:      'available',
      });
    }

    res.json({ message: 'Booking cancelled due to payment failure' });

  } catch (err) {
    console.error('Payment failed handler error:', err.message);
    res.status(500).json({ error: 'Failed to handle payment failure' });
  }
};

// ─── GET PAYMENT DETAILS ──────────────────────────────────────────────────────
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({ payment });

  } catch (err) {
    console.error('Get payment details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  paymentFailed,
  getPaymentDetails,
};