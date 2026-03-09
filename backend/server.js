const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

// ─── ROUTES ──────────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const movieRoutes   = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');

// ─── SOCKET ───────────────────────────────────────────────────────────────────
const initSeatSocket = require('./socket/seatSocket');

const app    = express();
const server = http.createServer(app);

// ─── SOCKET.IO SETUP ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,
  message:  { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'OK',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/movies',   movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment',  paymentRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── INIT SOCKET EVENTS ───────────────────────────────────────────────────────
initSeatSocket(io);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };