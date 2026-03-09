const { query } = require('../config/db');

const Movie = {

  // ─── GET ALL ACTIVE MOVIES ─────────────────────────────────────────────────
  async getAll({ genre, language, sortBy = 'rating' } = {}) {
    let sql    = `SELECT * FROM movies WHERE is_active = true`;
    const params = [];
    let idx    = 1;

    if (genre) {
      sql += ` AND $${idx} = ANY(genre)`;
      params.push(genre);
      idx++;
    }

    if (language) {
      sql += ` AND LOWER(language) = LOWER($${idx})`;
      params.push(language);
      idx++;
    }

    const allowed = ['rating', 'title', 'release_year', 'created_at'];
    const col     = allowed.includes(sortBy) ? sortBy : 'rating';
    sql          += ` ORDER BY ${col} DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  // ─── GET SINGLE MOVIE ──────────────────────────────────────────────────────
  async findById(id) {
    const result = await query(
      `SELECT * FROM movies WHERE id = $1 AND is_active = true`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── GET MOVIE WITH SHOWTIMES ──────────────────────────────────────────────
  async findWithShowtimes(movieId, date) {
    const result = await query(
      `SELECT
         m.*,
         json_agg(
           json_build_object(
             'showtime_id',   s.id,
             'show_date',     s.show_date,
             'show_time',     s.show_time,
             'price_premium', s.price_premium,
             'price_gold',    s.price_gold,
             'price_silver',  s.price_silver,
             'screen_name',   sc.screen_name,
             'venue_name',    v.name,
             'venue_id',      v.id,
             'city',          v.city
           ) ORDER BY s.show_time
         ) FILTER (WHERE s.id IS NOT NULL) AS showtimes
       FROM movies m
       LEFT JOIN showtimes s
         ON s.movie_id = m.id
         AND s.show_date = $2
         AND s.is_active = true
       LEFT JOIN screens sc ON sc.id = s.screen_id
       LEFT JOIN venues  v  ON v.id  = sc.venue_id
       WHERE m.id = $1 AND m.is_active = true
       GROUP BY m.id`,
      [movieId, date]
    );
    return result.rows[0] || null;
  },

  // ─── GET TRENDING (highest rated) ─────────────────────────────────────────
  async getTrending(limit = 8) {
    const result = await query(
      `SELECT * FROM movies
       WHERE is_active = true
       ORDER BY rating DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  // ─── GET DISTINCT GENRES ───────────────────────────────────────────────────
  async getGenres() {
    const result = await query(
      `SELECT DISTINCT UNNEST(genre) AS genre
       FROM movies WHERE is_active = true
       ORDER BY genre`
    );
    return result.rows.map((r) => r.genre);
  },

  // ─── GET DISTINCT LANGUAGES ────────────────────────────────────────────────
  async getLanguages() {
    const result = await query(
      `SELECT DISTINCT language FROM movies
       WHERE is_active = true
       ORDER BY language`
    );
    return result.rows.map((r) => r.language);
  },

  // ─── SEARCH ────────────────────────────────────────────────────────────────
  async search(term) {
    const result = await query(
      `SELECT * FROM movies
       WHERE is_active = true
       AND (
         LOWER(title) LIKE LOWER($1)
         OR LOWER(language) LIKE LOWER($1)
       )
       ORDER BY rating DESC`,
      [`%${term}%`]
    );
    return result.rows;
  },

};

module.exports = Movie;