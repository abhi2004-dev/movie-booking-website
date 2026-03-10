const express = require('express');
const router  = express.Router();
const {
  getAllMovies,
  getMovie,
  getMovieWithShowtimes,
  getTrending,
  searchMovies,
  getGenres,
  getLanguages,
  getSeatStatus,
} = require('../controllers/movieController');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/movies
router.get('/', getAllMovies);

// GET /api/movies/trending
router.get('/trending', getTrending);

// GET /api/movies/search?q=pushpa
router.get('/search', searchMovies);

// GET /api/movies/genres
router.get('/genres', getGenres);

// GET /api/movies/languages
router.get('/languages', getLanguages);

// GET /api/movies/:id
router.get('/:id', getMovie);

// GET /api/movies/:id/showtimes?date=2024-01-01
router.get('/:id/showtimes', getMovieWithShowtimes);

// GET /api/movies/showtimes/:showtimeId/seats
router.get('/showtimes/:showtimeId/seats', getSeatStatus);

module.exports = router;