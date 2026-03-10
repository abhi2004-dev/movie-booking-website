import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import { SkeletonRow } from '../components/Loader';

const GENRES    = ['All', 'Action', 'Drama', 'Thriller', 'Horror', 'Sci-Fi', 'Comedy'];
const LANGUAGES = ['All', 'Hindi', 'Telugu', 'Malayalam', 'Tamil'];
const SORTS     = [
  { label: 'Top Rated',  value: 'rating'       },
  { label: 'Latest',     value: 'release_year' },
  { label: 'Title A–Z',  value: 'title'        },
];

export default function MoviesPage() {
  const [movies,   setMovies]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [genre,    setGenre]    = useState('All');
  const [lang,     setLang]     = useState('All');
  const [sort,     setSort]     = useState('rating');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  // ─── FETCH ALL MOVIES ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await movieAPI.getAll();
        setMovies(res.data.movies);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ─── FILTER + SORT ────────────────────────────────────────────────────
  useEffect(() => {
    let list = [...movies];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q)
      );
    }

    // Genre
    if (genre !== 'All') {
      list = list.filter((m) => m.genre?.includes(genre));
    }

    // Language
    if (lang !== 'All') {
      list = list.filter((m) => m.language === lang);
    }

    // Sort
    list.sort((a, b) => {
      if (sort === 'rating')       return b.rating - a.rating;
      if (sort === 'release_year') return b.release_year - a.release_year;
      if (sort === 'title')        return a.title.localeCompare(b.title);
      return 0;
    });

    setFiltered(list);
  }, [movies, genre, lang, sort, search]);

  const resetFilters = () => {
    setGenre('All');
    setLang('All');
    setSort('rating');
    setSearch('');
  };

  const hasFilters = genre !== 'All' || lang !== 'All' || sort !== 'rating' || search;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', paddingTop: 90 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 44px 88px' }}>

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 40 }}
        >
          <div className="section-label">All Movies</div>
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            flexWrap:       'wrap',
            gap:            16,
          }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 56, fontWeight: 700, color: '#ede9e0',
            }}>Now Showing</h1>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position:  'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                fontSize:  16, pointerEvents: 'none',
              }}>🔍</span>
              <input
                className="field"
                placeholder="Search movies…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 42, width: 240 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── FILTERS ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 42 }}>

          {/* Genre */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 10, flexWrap: 'wrap' }}>
            {GENRES.map((g) => (
              <button key={g}
                className={`btn-outline ${genre === g ? 'active' : ''}`}
                style={{ padding: '6px 18px' }}
                onClick={() => setGenre(g)}
              >{g}</button>
            ))}
          </div>

          {/* Language + Sort */}
          <div style={{
            display:     'flex',
            gap:         9,
            flexWrap:    'wrap',
            alignItems:  'center',
          }}>
            {LANGUAGES.map((l) => (
              <button key={l}
                className={`btn-outline ${lang === l ? 'active' : ''}`}
                style={{ padding: '6px 16px' }}
                onClick={() => setLang(l)}
              >🌐 {l}</button>
            ))}

            {/* Divider */}
            <div style={{
              width:      1, height: 26,
              background: 'var(--border)', margin: '0 4px',
            }}/>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>Sort:</span>
              {SORTS.map((s) => (
                <button key={s.value}
                  className={`btn-outline ${sort === s.value ? 'active' : ''}`}
                  style={{ padding: '5px 14px' }}
                  onClick={() => setSort(s.value)}
                >{s.label}</button>
              ))}
            </div>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={resetFilters}
                style={{
                  background:   'rgba(224,48,58,0.1)',
                  border:       '1px solid rgba(224,48,58,0.3)',
                  borderRadius: 8, color: '#e0303a',
                  padding:      '5px 14px', fontSize: 12,
                  cursor:       'pointer',
                  fontFamily:   'Outfit, sans-serif',
                  transition:   'all 0.2s',
                }}
              >✕ Clear</button>
            )}
          </div>
        </div>

        {/* ─── RESULTS COUNT ─────────────────────────────────────────── */}
        {!loading && (
          <div style={{
            color:        'var(--muted)', fontSize: 13,
            marginBottom: 26,
          }}>
            Showing <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{filtered.length}</span> movie{filtered.length !== 1 ? 's' : ''}
            {genre !== 'All' && ` in ${genre}`}
            {lang  !== 'All' && ` · ${lang}`}
          </div>
        )}

        {/* ─── GRID ──────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <SkeletonRow count={4} />
            <SkeletonRow count={4} />
          </div>
        ) : filtered.length > 0 ? (
          <div style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(auto-fill, minmax(190px, 1fr))',
            gap:                   26,
          }}>
            {filtered.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} delay={i * 0.04} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <div style={{ fontSize: 56, marginBottom: 18 }}>🎬</div>
            <h3 style={{
              fontFamily:  "'Cormorant Garamond', serif",
              fontSize:    32, color: '#ede9e0', marginBottom: 10,
            }}>No Movies Found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              Try adjusting your filters or search query.
            </p>
            <button className="btn-gold"
              style={{ padding: '11px 28px', fontSize: 14 }}
              onClick={resetFilters}
            >Reset Filters</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}