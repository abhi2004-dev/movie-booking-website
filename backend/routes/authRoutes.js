const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  verifyToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
router.get('/profile',    protect, getProfile);
router.put('/profile',    protect, updateProfile);
router.get('/verify',     protect, verifyToken);

module.exports = router;