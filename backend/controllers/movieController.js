const Movie    = require('../models/Movie');
const Showtime = require('../models/Showtime');

// ─── GET ALL MOVIES ───────────────────────────────────────────────────────────
const getAllMovies = async (req, res) => {
  try {
    const { genre, language, sortBy } = req.query;
    const movies = await Movie.getAll({ genre, language, sortBy });

    res.json({
      count:  movies.length,
      movies,
    });

  } catch (err) {
    console.error('Get all movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

// ─── GET SINGLE MOVIE ─────────────────────────────────────────────────────────
const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie  = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ movie });

  } catch (err) {
    console.error('Get movie error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

// ─── GET MOVIE WITH SHOWTIMES ─────────────────────────────────────────────────
const getMovieWithShowtimes = async (req, res) => {
  try {
    const { id }  = req.params;
    const { date } = req.query;

    // Default to today if no date provided
    const showDate = date || new Date().toISOString().split('T')[0];

    const movie = await Movie.findWithShowtimes(id, showDate);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ movie, date: showDate });

  } catch (err) {
    console.error('Get movie with showtimes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
};

// ─── GET TRENDING MOVIES ──────────────────────────────────────────────────────
const getTrending = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit) || 8;
    const movies = await Movie.getTrending(limit);

    res.json({
      count:  movies.length,
      movies,
    });

  } catch (err) {
    console.error('Get trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
};

// ─── SEARCH MOVIES ────────────────────────────────────────────────────────────
const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const movies = await Movie.search(q.trim());

    res.json({
      query:  q,
      count:  movies.length,
      movies,
    });

  } catch (err) {
    console.error('Search movies error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
};

// ─── GET GENRES ───────────────────────────────────────────────────────────────
const getGenres = async (req, res) => {
  try {
    const genres = await Movie.getGenres();
    res.json({ genres });

  } catch (err) {
    console.error('Get genres error:', err.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

// ─── GET LANGUAGES ────────────────────────────────────────────────────────────
const getLanguages = async (req, res) => {
  try {
    const languages = await Movie.getLanguages();
    res.json({ languages });

  } catch (err) {
    console.error('Get languages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

// ─── GET SEAT STATUS FOR A SHOWTIME ───────────────────────────────────────────
const getSeatStatus = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    const seats = await Showtime.getSeatStatus(showtimeId);

    res.json({
      showtime_id: showtimeId,
      movie:       showtime.movie_title,
      show_date:   showtime.show_date,
      show_time:   showtime.show_time,
      venue:       showtime.venue_name,
      pricing: {
        premium: showtime.price_premium,
        gold:    showtime.price_gold,
        silver:  showtime.price_silver,
      },
      seats,
    });

  } catch (err) {
    console.error('Get seat status error:', err.message);
    res.status(500).json({ error: 'Failed to fetch seat status' });
  }
};

module.exports = {
  getAllMovies,
  getMovie,
  getMovieWithShowtimes,
  getTrending,
  searchMovies,
  getGenres,
  getLanguages,
  getSeatStatus,
};