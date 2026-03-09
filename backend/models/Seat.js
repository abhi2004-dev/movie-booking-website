const { query } = require('../config/db');

const Seat = {

  // ─── GET ALL SEATS FOR A SCREEN ───────────────────────────────────────────
  async getByScreen(screenId) {
    const result = await query(
      `SELECT * FROM seats
       WHERE screen_id = $1
       ORDER BY row_label, seat_number`,
      [screenId]
    );
    return result.rows;
  },

  // ─── GET SINGLE SEAT ──────────────────────────────────────────────────────
  async findByCode(screenId, seatCode) {
    const result = await query(
      `SELECT * FROM seats
       WHERE screen_id = $1 AND seat_code = $2`,
      [screenId, seatCode]
    );
    return result.rows[0] || null;
  },

  // ─── VALIDATE SEAT CODES BELONG TO SCREEN ─────────────────────────────────
  async validateSeats(screenId, seatCodes) {
    const result = await query(
      `SELECT seat_code FROM seats
       WHERE screen_id = $1
         AND seat_code = ANY($2)`,
      [screenId, seatCodes]
    );
    const found = result.rows.map((r) => r.seat_code);
    const invalid = seatCodes.filter((s) => !found.includes(s));
    return {
      valid:   invalid.length === 0,
      invalid,
    };
  },

  // ─── GET CATEGORY OF A SEAT ───────────────────────────────────────────────
  async getCategory(screenId, seatCode) {
    const result = await query(
      `SELECT category FROM seats
       WHERE screen_id = $1 AND seat_code = $2`,
      [screenId, seatCode]
    );
    return result.rows[0]?.category || null;
  },

  // ─── GET SEATS BY CATEGORY ────────────────────────────────────────────────
  async getByCategory(screenId, category) {
    const result = await query(
      `SELECT * FROM seats
       WHERE screen_id = $1 AND category = $2
       ORDER BY row_label, seat_number`,
      [screenId, category]
    );
    return result.rows;
  },

  // ─── CALCULATE TOTAL PRICE FOR SELECTED SEATS ─────────────────────────────
  async calculatePrice(screenId, seatCodes, pricing) {
    const result = await query(
      `SELECT seat_code, category FROM seats
       WHERE screen_id = $1
         AND seat_code = ANY($2)`,
      [screenId, seatCodes]
    );

    let total = 0;
    result.rows.forEach((seat) => {
      if (seat.category === 'premium') total += Number(pricing.price_premium);
      if (seat.category === 'gold')    total += Number(pricing.price_gold);
      if (seat.category === 'silver')  total += Number(pricing.price_silver);
    });

    const convenienceFee = Math.round(total * 0.04);
    const grandTotal     = total + convenienceFee;

    return {
      subtotal:        total,
      convenience_fee: convenienceFee,
      grand_total:     grandTotal,
      breakdown:       result.rows,
    };
  },

  // ─── GET ROWS SUMMARY (for seat map display) ──────────────────────────────
  async getRowsSummary(screenId) {
    const result = await query(
      `SELECT
         row_label,
         category,
         COUNT(*) AS total_seats,
         MIN(seat_number) AS from_seat,
         MAX(seat_number) AS to_seat
       FROM seats
       WHERE screen_id = $1
       GROUP BY row_label, category
       ORDER BY row_label`,
      [screenId]
    );
    return result.rows;
  },

};

module.exports = Seat;