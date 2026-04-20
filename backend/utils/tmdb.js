const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_DEMO_KEY_HERE';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Helper to fetch from TMDB
async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch TMDB Error:', error.message);
    return null;
  }
}

// Format TMDB movie to our internal schema
function formatMovie(tmdbMovie) {
  if (!tmdbMovie) return null;
  return {
    // Generate a deterministic UUID based on TMDB ID for simplicity, or just map it if we changed the DB schema.
    // Wait, our DB schema uses UUID. We can generate a UUID from the TMDB string, or simply let the DB create one, 
    // but we need to track the tmdb_id to avoid duplicates. 
    // Since we don't have tmdb_id in the DB right now, we can map tmdb_id to the title or just use a stable UUID algorithm.
    // A simple hack: pad the tmdb_id to a UUID format: e.g., '00000000-0000-0000-0000-0000000xxxxx'
    id: `00000000-0000-0000-0000-${String(tmdbMovie.id).padStart(12, '0')}`,
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    duration: tmdbMovie.runtime || 120, // Default to 120 if not provided in lists
    language: tmdbMovie.original_language === 'hi' ? 'Hindi' : tmdbMovie.original_language === 'te' ? 'Telugu' : 'English',
    genre: ['Action', 'Drama'], // We'll just hardcode or map genre IDs later
    rating: tmdbMovie.vote_average,
    release_year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.substring(0, 4)) : 2024,
    poster_url: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : '',
    trailer_url: tmdbMovie.backdrop_path ? `${TMDB_IMAGE_BASE_URL_ORIGINAL}${tmdbMovie.backdrop_path}` : '' // We'll use trailer_url for backdrop for now to avoid DB migrations!
  };
}

const tmdbService = {
  async getTrending() {
    const data = await fetchTMDB('/trending/movie/week');
    if (!data || !data.results) return [];
    return data.results.map(formatMovie);
  },

  async searchMovies(query) {
    const data = await fetchTMDB('/search/movie', { query });
    if (!data || !data.results) return [];
    return data.results.map(formatMovie);
  },

  async getMovieDetails(tmdbId) {
    const data = await fetchTMDB(`/movie/${tmdbId}`);
    return formatMovie(data);
  }
};

module.exports = tmdbService;
