// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error('─────────────────────────────────────');
  console.error('❌ Error:', err.message);
  console.error('📍 Path:', req.originalUrl);
  console.error('🕐 Time:', new Date().toISOString());
  if (process.env.NODE_ENV === 'development') {
    console.error('📚 Stack:', err.stack);
  }
  console.error('─────────────────────────────────────');

  // ─── POSTGRES ERRORS ────────────────────────────────────────────────────────
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry — this record already exists.',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referenced record does not exist.',
    });
  }

  if (err.code === '23502') {
    return res.status(400).json({
      error: 'A required field is missing.',
    });
  }

  if (err.code === '22P02') {
    return res.status(400).json({
      error: 'Invalid ID format.',
    });
  }

  // ─── JWT ERRORS ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired. Please login again.' });
  }

  // ─── VALIDATION ERRORS ──────────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // ─── RAZORPAY ERRORS ────────────────────────────────────────────────────────
  if (err.statusCode && err.error) {
    return res.status(err.statusCode).json({
      error: err.error.description || 'Payment gateway error.',
    });
  }

  // ─── DEFAULT ────────────────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Something went wrong. Please try again.';

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error.'
      : message,
  });
};

module.exports = errorHandler;