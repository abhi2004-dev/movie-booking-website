const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect',  () => console.log('✅ Redis connected successfully'));
redisClient.on('error',   (err) => console.error('❌ Redis error:', err.message));
redisClient.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

// Connect immediately
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  }
})();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Lock a seat for N seconds (default 10 minutes)
const lockSeat = async (showtimeId, seatCode, userId, ttl = 600) => {
  const key = `seat_lock:${showtimeId}:${seatCode}`;
  await redisClient.set(key, userId, { EX: ttl, NX: true });
};

// Unlock a seat
const unlockSeat = async (showtimeId, seatCode) => {
  const key = `seat_lock:${showtimeId}:${seatCode}`;
  await redisClient.del(key);
};

// Check if a seat is locked
const isSeatLocked = async (showtimeId, seatCode) => {
  const key = `seat_lock:${showtimeId}:${seatCode}`;
  const val = await redisClient.get(key);
  return val !== null;
};

// Get all locked seats for a showtime
const getLockedSeats = async (showtimeId) => {
  const pattern = `seat_lock:${showtimeId}:*`;
  const keys    = await redisClient.keys(pattern);
  return keys.map((k) => k.split(':')[2]); // extract seat codes
};

// Unlock multiple seats at once
const unlockMultipleSeats = async (showtimeId, seatCodes) => {
  const keys = seatCodes.map((s) => `seat_lock:${showtimeId}:${s}`);
  if (keys.length > 0) await redisClient.del(keys);
};

module.exports = {
  redisClient,
  lockSeat,
  unlockSeat,
  isSeatLocked,
  getLockedSeats,
  unlockMultipleSeats,
};