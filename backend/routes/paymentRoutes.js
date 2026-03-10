const express = require('express');
const router  = express.Router();
const {
  createOrder,
  verifyPayment,
  paymentFailed,
  getPaymentDetails,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ─── ALL PAYMENT ROUTES ARE PROTECTED ─────────────────────────────────────────

// POST /api/payment/order
// Create a Razorpay order before showing payment popup
router.post('/order', protect, createOrder);

// POST /api/payment/verify
// Verify payment signature after successful payment
router.post('/verify', protect, verifyPayment);

// POST /api/payment/failed
// Handle payment failure — cancel booking + unlock seats
router.post('/failed', protect, paymentFailed);

// GET /api/payment/:paymentId
// Fetch payment details from Razorpay
router.get('/:paymentId', protect, getPaymentDetails);

module.exports = router;