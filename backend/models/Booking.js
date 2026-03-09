const { query, getClient } = require('../config/db');

const Booking = {

  // ─── CREATE BOOKING (with transaction) ────────────────────────────────────
  async create({ userId, showtimeId, seats, subtotal, convenienceFee, grandTotal, orderId }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Insert booking record
      const bookingResult = await client.query(
        `INSERT INTO bookings
           (user_id, showtime_id, seats, total_amount, convenience_fee, grand_total, status, order_id)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING *`,
        [userId, showtimeId, seats, subtotal, convenienceFee, grandTotal, orderId]
      );
      const booking = bookingResult.rows[0];

      // 2. Insert each seat into booked_seats table
      for (const seatCode of seats) {
        await client.query(
          `INSERT INTO booked_seats (showtime_id, seat_code, booking_id)
           VALUES ($1, $2, $3)`,
          [showtimeId, seatCode, booking.id]
        );
      }

      await client.query('COMMIT');
      return booking;

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ─── CONFIRM BOOKING (after payment success) ──────────────────────────────
  async confirm(bookingId, paymentId) {
    const result = await query(
      `UPDATE bookings
       SET status     = 'confirmed',
           payment_id = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [bookingId, paymentId]
    );
    return result.rows[0];
  },

  // ─── CANCEL BOOKING ────────────────────────────────────────────────────────
  async cancel(bookingId) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Update booking status
      const result = await client.query(
        `UPDATE bookings
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [bookingId]
      );
      const booking = result.rows[0];

      // 2. Remove seats from booked_seats
      await client.query(
        `DELETE FROM booked_seats WHERE booking_id = $1`,
        [bookingId]
      );

      await client.query('COMMIT');
      return booking;

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ─── GET BOOKING BY ID ─────────────────────────────────────────────────────
  async findById(id) {
    const result = await query(
      `SELECT
         b.*,
         m.title        AS movie_title,
         m.language     AS movie_language,
         m.duration     AS movie_duration,
         s.show_date,
         s.show_time,
         sc.screen_name,
         v.name         AS venue_name,
         v.city         AS venue_city,
         v.address      AS venue_address,
         u.name         AS user_name,
         u.email        AS user_email,
         u.phone        AS user_phone
       FROM bookings b
       JOIN showtimes s  ON s.id  = b.showtime_id
       JOIN movies    m  ON m.id  = s.movie_id
       JOIN screens   sc ON sc.id = s.screen_id
       JOIN venues    v  ON v.id  = sc.venue_id
       JOIN users     u  ON u.id  = b.user_id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── GET ALL BOOKINGS FOR A USER ───────────────────────────────────────────
  async findByUser(userId) {
    const result = await query(
      `SELECT
         b.*,
         m.title        AS movie_title,
         m.language     AS movie_language,
         s.show_date,
         s.show_time,
         sc.screen_name,
         v.name         AS venue_name,
         v.city         AS venue_city
       FROM bookings b
       JOIN showtimes s  ON s.id  = b.showtime_id
       JOIN movies    m  ON m.id  = s.movie_id
       JOIN screens   sc ON sc.id = s.screen_id
       JOIN venues    v  ON v.id  = sc.venue_id
       WHERE b.user_id = $1
       ORDER BY b.booked_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // ─── GET BOOKING BY ORDER ID ───────────────────────────────────────────────
  async findByOrderId(orderId) {
    const result = await query(
      `SELECT * FROM bookings WHERE order_id = $1`,
      [orderId]
    );
    return result.rows[0] || null;
  },

  // ─── CHECK IF USER OWNS BOOKING ────────────────────────────────────────────
  async isOwner(bookingId, userId) {
    const result = await query(
      `SELECT id FROM bookings
       WHERE id = $1 AND user_id = $2`,
      [bookingId, userId]
    );
    return result.rows.length > 0;
  },

};

module.exports = Booking;