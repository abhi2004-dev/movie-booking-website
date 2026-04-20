const express = require('express');
const router  = express.Router();
const {
  sendOtp,
  verifyOtp,
  googleLogin,
  getProfile,
  updateProfile,
  verifyToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.post('/send-otp',    sendOtp);
router.post('/verify-otp',  verifyOtp);
router.post('/google-login', googleLogin);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
router.get('/profile',    protect, getProfile);
router.put('/profile',    protect, updateProfile);
router.get('/verify',     protect, verifyToken);

module.exports = router;