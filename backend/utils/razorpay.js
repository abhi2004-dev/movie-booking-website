const crypto    = require('crypto');
const Razorpay  = require('razorpay');
require('dotenv').config();

// ─── INIT RAZORPAY INSTANCE ───────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const order = await razorpay.orders.create({
    amount:   Math.round(amount * 100), // paise
    currency,
    receipt,
    notes,
  });
  return order;
};

// ─── VERIFY SIGNATURE ─────────────────────────────────────────────────────────
const verifySignature = ({ orderId, paymentId, signature }) => {
  const body     = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

// ─── FETCH PAYMENT ────────────────────────────────────────────────────────────
const fetchPayment = async (paymentId) => {
  return await razorpay.payments.fetch(paymentId);
};

// ─── FETCH ORDER ──────────────────────────────────────────────────────────────
const fetchOrder = async (orderId) => {
  return await razorpay.orders.fetch(orderId);
};

// ─── REFUND PAYMENT ───────────────────────────────────────────────────────────
const refundPayment = async (paymentId, amount) => {
  return await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100), // paise
  });
};

// ─── FORMAT AMOUNT (paise to rupees) ─────────────────────────────────────────
const formatAmount = (paise) => (paise / 100).toFixed(2);

// ─── CONVERT TO PAISE ─────────────────────────────────────────────────────────
const toPaise = (rupees) => Math.round(rupees * 100);

module.exports = {
  razorpay,
  createOrder,
  verifySignature,
  fetchPayment,
  fetchOrder,
  refundPayment,
  formatAmount,
  toPaise,
};