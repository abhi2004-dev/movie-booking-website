const { query } = require('../config/db');

const Showtime = {

  // ─── GET BY ID ─────────────────────────────────────────────────────────────
  async findById(id) {
    const result = await query(
      `SELECT
         s.*,
         m.title        AS movie_title,
         m.duration     AS movie_duration,
         m.language     AS movie_language,
         sc.screen_name,
         sc.total_rows,
         sc.seats_per_row,
         v.id           AS venue_id,
         v.name         AS venue_name,
         v.city         AS venue_city,
         v.address      AS venue_address
       FROM showtimes s
       JOIN movies  m  ON m.id  = s.movie_id
       JOIN screens sc ON sc.id = s.screen_id
       JOIN venues  v  ON v.id  = sc.venue_id
       WHERE s.id = $1 AND s.is_active = true`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── GET BY MOVIE + DATE ───────────────────────────────────────────────────
  async findByMovieAndDate(movieId, date) {
    const result = await query(
      `SELECT
         s.*,
         sc.screen_name,
         v.id    AS venue_id,
         v.name  AS venue_name,
         v.city  AS venue_city
       FROM showtimes s
       JOIN screens sc ON sc.id = s.screen_id
       JOIN venues  v  ON v.id  = sc.venue_id
       WHERE s.movie_id  = $1
         AND s.show_date = $2
         AND s.is_active = true
       ORDER BY v.name, s.show_time`,
      [movieId, date]
    );
    return result.rows;
  },

  // ─── GET SEAT STATUS FOR A SHOWTIME ───────────────────────────────────────
  // Returns all seats with their status: available / booked
  async getSeatStatus(showtimeId) {
    const result = await query(
      `SELECT
         se.seat_code,
         se.row_label,
         se.seat_number,
         se.category,
         CASE
           WHEN bs.seat_code IS NOT NULL THEN 'booked'
           ELSE 'available'
         END AS status
       FROM showtimes s
       JOIN screens sc ON sc.id = s.screen_id
       JOIN seats   se ON se.screen_id = sc.id
       LEFT JOIN booked_seats bs
         ON bs.showtime_id = s.id
         AND bs.seat_code  = se.seat_code
       WHERE s.id = $1
       ORDER BY se.row_label, se.seat_number`,
      [showtimeId]
    );
    return result.rows;
  },

  // ─── GET BOOKED SEAT CODES FOR A SHOWTIME ─────────────────────────────────
  async getBookedSeats(showtimeId) {
    const result = await query(
      `SELECT seat_code FROM booked_seats
       WHERE showtime_id = $1`,
      [showtimeId]
    );
    return result.rows.map((r) => r.seat_code);
  },

  // ─── CHECK IF SEATS ARE AVAILABLE ─────────────────────────────────────────
  async areSeatsFree(showtimeId, seatCodes) {
    const result = await query(
      `SELECT seat_code FROM booked_seats
       WHERE showtime_id = $1
         AND seat_code = ANY($2)`,
      [showtimeId, seatCodes]
    );
    return result.rows.length === 0; // true = all free
  },

  // ─── GET PRICE FOR SEAT CATEGORY ──────────────────────────────────────────
  async getPricing(showtimeId) {
    const result = await query(
      `SELECT price_premium, price_gold, price_silver
       FROM showtimes WHERE id = $1`,
      [showtimeId]
    );
    return result.rows[0] || null;
  },

};

module.exports = Showtime;