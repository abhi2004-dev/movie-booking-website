import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import { SkeletonRow } from '../components/Loader';
import { getMovieMeta } from '../utils/helpers';

const GENRES = ['All', 'Action', 'Drama', 'Thriller', 'Horror', 'Sci-Fi', 'Comedy'];

export default function HomePage() {
  const [movies,      setMovies]      = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [genre,       setGenre]       = useState('All');
  const [loading,     setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieAPI.getTrending(8);
        setMovies(res.data.movies);
        setFiltered(res.data.movies);
      } catch {
        // fallback — still show page
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (genre === 'All') {
      setFiltered(movies);
    } else {
      setFiltered(movies.filter((m) => m.genre?.includes(genre)));
    }
  }, [genre, movies]);

  const featured = movies[0];
  const featuredMeta = featured ? getMovieMeta(featured.id) : null;

  return (
    <div>
      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: '100vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        {/* TMDB Backdrop */}
        {featured?.trailer_url ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.trailer_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            filter: 'blur(4px)',
          }}/>
        ) : featuredMeta && (
          <div style={{
            position: 'absolute', inset: 0,
            background: featuredMeta.grad, opacity: 0.55,
          }}/>
        )}
        <div style={{
          position:   'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(7,7,15,1) 0%, rgba(7,7,15,0.4) 50%, rgba(7,7,15,1) 100%), linear-gradient(to bottom, transparent 60%, #07070f 100%)',
        }}/>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3 + i * 0.7, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: 3, height: 3, borderRadius: '50%',
              background: 'var(--gold)', opacity: 0.3 + i * 0.08,
              left: `${12 + i * 14}%`, top: `${20 + i * 8}%`,
            }}
          />
        ))}

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1180, margin: '0 auto',
          padding: '0 44px', width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 12, marginBottom: 18,
            }}>
              <div style={{ width: 44, height: 2, background: 'var(--gold)', borderRadius: 1 }}/>
              <span style={{
                color: 'var(--gold)', fontSize: 11, fontWeight: 700,
                letterSpacing: 3.5, textTransform: 'uppercase',
              }}>Now Showing</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily:  "'Cormorant Garamond', serif",
              fontSize:    'clamp(44px, 7vw, 94px)',
              fontWeight:  700, lineHeight: 1.02,
              color:       '#ede9e0', marginBottom: 18,
            }}>
              {featured?.title || 'Book Your Perfect Movie Experience'}
            </h1>

            {/* Meta row */}
            {featured && (
              <div style={{
                display: 'flex', gap: 14, alignItems: 'center',
                marginBottom: 26, flexWrap: 'wrap',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg,#f0c040,#d0901a)',
                  color: '#06060c', fontWeight: 800,
                  fontSize: 13, padding: '4px 10px', borderRadius: 5,
                }}>⭐ {featured.rating}/10</span>
                {featured.genre?.slice(0, 2).map((g) => (
                  <span key={g} style={{ color: '#aaa8b8', fontSize: 14 }}>{g}</span>
                ))}
                <span style={{ color: '#444' }}>•</span>
                <span style={{ color: '#aaa8b8', fontSize: 14 }}>
                  {Math.floor(featured.duration / 60)}h {featured.duration % 60}m
                </span>
                <span style={{ color: '#444' }}>•</span>
                <span style={{ color: '#aaa8b8', fontSize: 14 }}>{featured.language}</span>
              </div>
            )}

            <p style={{
              color: '#9896a8', maxWidth: 460,
              lineHeight: 1.78, marginBottom: 38, fontSize: 15,
            }}>
              {featured
                ? featured.description?.slice(0, 160) + '…'
                : 'Experience cinema like never before. Book your seats instantly, choose your perfect spot, and enjoy the show.'}
            </p>

            <div style={{ display: 'flex', gap: 14 }}>
              <button className="btn-gold"
                style={{ padding: '15px 34px', fontSize: 15 }}
                onClick={() => featured ? navigate(`/movies/${featured.id}`) : navigate('/movies')}
              >🎟️&nbsp; Book Tickets</button>
              <button className="btn-ghost"
                style={{ padding: '15px 26px', fontSize: 15 }}
                onClick={() => navigate('/movies')}
              >🎬&nbsp; All Movies</button>
            </div>
          </motion.div>
        </div>

        {/* Floating poster */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:     'absolute', right: '7%', top: '50%',
              transform:    'translateY(-50%)',
              width: 280, height: 420,
              borderRadius: 18,
              background:   'var(--surface)',
              border:       '1px solid rgba(240,192,64,0.25)',
              boxShadow:    '0 50px 120px rgba(0,0,0,0.85)',
              overflow:     'hidden',
            }}
          >
            {featured.poster_url ? (
              <img src={featured.poster_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : featuredMeta && (
              <div style={{ position: 'absolute', inset: 0, background: featuredMeta.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>{featuredMeta.icon}</div>
            )}
            <div style={{
              position:   'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(7,7,15,0.95) 0%, transparent 40%)',
            }}/>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22,
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, fontWeight: 700, color: '#ede9e0', lineHeight: 1.2,
              }}>{featured.title}</div>
              <div style={{ color: 'var(--gold)', fontSize: 11, marginTop: 5, letterSpacing: 2.5 }}>
                {featured.release_year} • {featured.language?.toUpperCase()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Scroll hint */}
        <div style={{
          position:       'absolute', bottom: 34, left: '50%',
          transform:      'translateX(-50%)',
          display:        'flex', flexDirection: 'column',
          alignItems:     'center', gap: 8,
        }}>
          <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 1, height: 32,
              background: 'linear-gradient(to bottom, var(--gold), transparent)',
            }}
          />
        </div>
      </div>

      {/* ─── TRENDING ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '88px 44px' }}>
        {/* Header */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-end',
          marginBottom:   34,
        }}>
          <div>
            <div className="section-label">What's Hot</div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 46, fontWeight: 700, color: '#ede9e0',
            }}>Trending This Week</h2>
          </div>
          <span
            onClick={() => navigate('/movies')}
            style={{
              color: 'var(--gold)', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = 0.7}
            onMouseLeave={(e) => e.target.style.opacity = 1}
          >View All →</span>
        </div>

        {/* Genre filters */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 36, flexWrap: 'wrap' }}>
          {GENRES.map((g) => (
            <button key={g}
              className={`btn-outline ${genre === g ? 'active' : ''}`}
              style={{ padding: '6px 18px' }}
              onClick={() => setGenre(g)}
            >{g}</button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div style={{
            display: 'flex', gap: 22,
            overflowX: 'auto', paddingBottom: 12,
          }} className="no-scrollbar">
            {filtered.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} delay={i * 0.06} />
            ))}
            {filtered.length === 0 && (
              <div style={{ color: 'var(--muted)', padding: '40px 0', fontSize: 14 }}>
                No movies in this genre right now.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <div style={{
        background:   'linear-gradient(135deg,#0f0f1e,#161630)',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding:      '68px 44px',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 44,
        }}>
          {[
            { icon: '🎭', title: 'Premium Screens',  desc: 'Dolby Atmos & IMAX certified halls'    },
            { icon: '⚡', title: 'Instant Booking',  desc: 'Confirmed seats in under 60 seconds'   },
            { icon: '🔒', title: 'Secure Payments',  desc: '256-bit SSL + Razorpay protection'     },
            { icon: '📱', title: 'E-Tickets',        desc: 'Scan QR at gate — no queues ever'      },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, color: '#ede9e0', fontSize: 16, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── CTA BANNER ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '88px 44px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background:   'linear-gradient(135deg, #0f0f1e, #181830)',
            border:       '1px solid rgba(240,192,64,0.15)',
            borderRadius: 22,
            padding:      '64px 44px',
            textAlign:    'center',
            position:     'relative',
            overflow:     'hidden',
          }}
        >
          {/* BG glow */}
          <div style={{
            position:     'absolute', top: '50%', left: '50%',
            transform:    'translate(-50%,-50%)',
            width:        400, height: 200,
            background:   'radial-gradient(ellipse, rgba(240,192,64,0.06) 0%, transparent 70%)',
            pointerEvents:'none',
          }}/>

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎬</div>
            <h2 style={{
              fontFamily:  "'Cormorant Garamond', serif",
              fontSize:    52, fontWeight: 700,
              color:       '#ede9e0', marginBottom: 14,
            }}>Ready for the Show?</h2>
            <p style={{
              color:      'var(--muted)', fontSize: 16,
              maxWidth:   480, margin: '0 auto 34px',
              lineHeight: 1.7,
            }}>
              Hundreds of movies. Thousands of seats. One seamless booking experience.
            </p>
            <button
              className="btn-gold"
              style={{ padding: '16px 44px', fontSize: 16 }}
              onClick={() => navigate('/movies')}
            >
              Browse All Movies →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}