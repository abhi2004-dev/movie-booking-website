const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getClient } = require('../config/redis'); // Using raw redis client to store OTPs
const mailer = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── GENERATE TOKEN ───────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (expires in 5 mins)
    const redis = await getClient();
    await redis.set(`otp:${email}`, otp, { EX: 300 });

    // Send Email
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Your Cinéplex Verification Code</h2>
        <p>Use the following code to log in or sign up to your account.</p>
        <h1 style="color: #f0c040; letter-spacing: 5px; font-size: 36px; background: #07070f; padding: 15px; border-radius: 8px; display: inline-block;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      </div>
    `;
    await mailer.sendEmail(email, 'Your Cinéplex OTP', html);

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const redis = await getClient();
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP matched, delete it
    await redis.del(`otp:${email}`);

    // Check if user exists
    let user = await User.findByEmail(email);
    
    // If new user, create them
    if (!user) {
      user = await User.create({ 
        name: 'Cinéplex User', // Default name, they can update in profile
        email, 
      });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential is required' });

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists by Google ID or Email
    let user = await User.findByGoogleId(googleId);
    if (!user) {
      user = await User.findByEmail(email);
      if (user) {
        // Update existing user with google_id (not explicitly supported by our simple model, 
        // but we can just use the user we found by email)
      } else {
        // Create new user
        user = await User.create({
          name: name,
          email: email,
          google_id: googleId
        });
      }
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Google login successful',
      token,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const updated = await User.update(req.user.id, { name, phone });
    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ─── VERIFY TOKEN ─────────────────────────────────────────────────────────────
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ valid: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Token verification failed' });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  googleLogin,
  getProfile,
  updateProfile,
  verifyToken,
};