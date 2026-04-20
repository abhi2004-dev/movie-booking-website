const { query } = require('../config/db');
const bcrypt    = require('bcryptjs');

const User = {

  // ─── CREATE ────────────────────────────────────────────────────────────────
  async create({ name, email, phone = null, password = null, google_id = null }) {
    let hashed = null;
    if (password) {
      hashed = await bcrypt.hash(password, 12);
    }
    const result = await query(
      `INSERT INTO users (name, email, phone, password, google_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, phone, hashed, google_id]
    );
    return result.rows[0];
  },

  // ─── FIND BY EMAIL ─────────────────────────────────────────────────────────
  async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  // ─── FIND BY GOOGLE ID ─────────────────────────────────────────────────────
  async findByGoogleId(googleId) {
    const result = await query(
      `SELECT * FROM users WHERE google_id = $1`,
      [googleId]
    );
    return result.rows[0] || null;
  },

  // ─── FIND BY ID ────────────────────────────────────────────────────────────
  async findById(id) {
    const result = await query(
      `SELECT id, name, email, phone, role, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── FIND BY PHONE ─────────────────────────────────────────────────────────
  async findByPhone(phone) {
    const result = await query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );
    return result.rows[0] || null;
  },

  // ─── COMPARE PASSWORD ──────────────────────────────────────────────────────
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // ─── UPDATE ────────────────────────────────────────────────────────────────
  async update(id, { name, phone }) {
    const result = await query(
      `UPDATE users
       SET name = $1, phone = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, phone, role`,
      [name, phone, id]
    );
    return result.rows[0];
  },

  // ─── CHECK EXISTS ──────────────────────────────────────────────────────────
  async emailExists(email) {
    const result = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    return result.rows.length > 0;
  },

  async phoneExists(phone) {
    const result = await query(
      `SELECT id FROM users WHERE phone = $1`,
      [phone]
    );
    return result.rows.length > 0;
  },

};

module.exports = User;