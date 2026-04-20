const Movie    = require('../models/Movie');
const Showtime = require('../models/Showtime');
const tmdbService = require('../utils/tmdb');
const { query } = require('../config/db'); // Needed for dynamic showtimes

// Helper to extract TMDB ID from our UUID format
function getTmdbId(uuid) {
  const parts = uuid.split('-');
  if (parts.length === 5 && parts[0] === '00000000') {
    return parseInt(parts[4], 10);
  }
  return null;
}

// ─── GET ALL MOVIES ───────────────────────────────────────────────────────────
const getAllMovies = async (req, res) => {
  try {
    const { genre, language, sortBy } = req.query;
    // Just fetch trending from TMDB to keep it fresh, then fallback to DB filtering
    const tmdbMovies = await tmdbService.getTrending();
    if (tmdbMovies && tmdbMovies.length > 0) {
      for (const m of tmdbMovies) {
        await Movie.upsertMovie(m);
      }
    }
    
    const movies = await Movie.getAll({ genre, language, sortBy });
    res.json({ count: movies.length, movies });
  } catch (err) {
    console.error('Get all movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

// ─── GET SINGLE MOVIE ─────────────────────────────────────────────────────────
const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let movie  = await Movie.findById(id);

    // If not found in local DB and it's a TMDB UUID, try fetching details
    if (!movie) {
      const tmdbId = getTmdbId(id);
      if (tmdbId) {
        const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
        if (tmdbMovie) {
          movie = await Movie.upsertMovie(tmdbMovie);
        }
      }
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ movie });
  } catch (err) {
    console.error('Get movie error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

// ─── DYNAMIC SHOWTIME GENERATOR ───────────────────────────────────────────────
async function generateMockShowtimes(movieId, date) {
  // Get some venues
  const venuesResult = await query('SELECT * FROM public.venues LIMIT 3');
  const venues = venuesResult.rows;
  if (venues.length === 0) return;

  // Insert showtimes dynamically for this date and movie
  for (const venue of venues) {
    // Get first screen for venue
    const screenResult = await query('SELECT id FROM public.screens WHERE venue_id = $1 LIMIT 1', [venue.id]);
    if (screenResult.rows.length === 0) continue;
    const screenId = screenResult.rows[0].id;

    const times = ['10:15:00', '13:30:00', '17:00:00', '20:30:00'];
    for (const time of times) {
      await query(`
        INSERT INTO public.showtimes (movie_id, screen_id, show_date, show_time, price_premium, price_gold, price_silver)
        VALUES ($1, $2, $3, $4, 300, 200, 150)
        ON CONFLICT DO NOTHING
      `, [movieId, screenId, date, time]);
    }
  }
}

// ─── GET MOVIE WITH SHOWTIMES ─────────────────────────────────────────────────
const getMovieWithShowtimes = async (req, res) => {
  try {
    const { id }  = req.params;
    const { date } = req.query;
    const showDate = date || new Date().toISOString().split('T')[0];

    let movie = await Movie.findWithShowtimes(id, showDate);

    // If movie found but no showtimes, let's generate them!
    if (movie && (!movie.showtimes || movie.showtimes.length === 0)) {
      await generateMockShowtimes(id, showDate);
      // Refetch after generating
      movie = await Movie.findWithShowtimes(id, showDate);
    } 
    // If movie NOT found locally, check TMDB
    else if (!movie) {
      const tmdbId = getTmdbId(id);
      if (tmdbId) {
        const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
        if (tmdbMovie) {
          await Movie.upsertMovie(tmdbMovie);
          await generateMockShowtimes(id, showDate);
          movie = await Movie.findWithShowtimes(id, showDate);
        }
      }
    }

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
    
    // Fetch from TMDB
    const tmdbMovies = await tmdbService.getTrending();
    if (tmdbMovies && tmdbMovies.length > 0) {
      // Upsert to local DB
      for (const m of tmdbMovies.slice(0, limit)) {
        await Movie.upsertMovie(m);
      }
    }

    // Return from DB
    const movies = await Movie.getTrending(limit);
    res.json({ count: movies.length, movies });
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

    // Fetch from TMDB
    const tmdbMovies = await tmdbService.searchMovies(q.trim());
    if (tmdbMovies && tmdbMovies.length > 0) {
      // Upsert top 5 results
      for (const m of tmdbMovies.slice(0, 5)) {
        await Movie.upsertMovie(m);
      }
    }

    const movies = await Movie.search(q.trim());
    res.json({ query: q, count: movies.length, movies });
  } catch (err) {
    console.error('Search movies error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
};

// ─── GET GENRES & LANGUAGES ───────────────────────────────────────────────────
const getGenres = async (req, res) => {
  try {
    const genres = await Movie.getGenres();
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

const getLanguages = async (req, res) => {
  try {
    const languages = await Movie.getLanguages();
    res.json({ languages });
  } catch (err) {
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
    res.status(500).json({ error: 'Failed to fetch seat status' });
  }
};

module.exports = {
  getAllMovies, getMovie, getMovieWithShowtimes, getTrending,
  searchMovies, getGenres, getLanguages, getSeatStatus,
};