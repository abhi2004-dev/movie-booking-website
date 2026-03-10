import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { movieAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { PageLoader } from '../components/Loader';
import { getMovieMeta, formatTime, getDayLabel, daysFromNow, today, tomorrow } from '../utils/helpers';
import toast from 'react-hot-toast';

const DATES = [
  { label: 'Today',     value: today()           },
  { label: 'Tomorrow',  value: tomorrow()         },
  { label: daysFromNow(2) && new Date(daysFromNow(2)).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), value: daysFromNow(2) },
  { label: daysFromNow(3) && new Date(daysFromNow(3)).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), value: daysFromNow(3) },
];

export default function MovieDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { setMovie, setShowtime, setDate, isAuthed } = useBooking();

  const [movie,       setMovieData]  = useState(null);
  const [showtimes,   setShowtimes]  = useState([]);
  const [date,        setDateLocal]  = useState(today());
  const [loading,     setLoading]    = useState(true);
  const [selectedShow,setSelectedShow] = useState(null);

  const meta = movie ? getMovieMeta(movie.id) : null;

  // ─── FETCH MOVIE + SHOWTIMES ──────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await movieAPI.getWithShowtimes(id, date);
        setMovieData(res.data.movie);
        setShowtimes(res.data.movie.showtimes || []);
        setSelectedShow(null);
      } catch {
        toast.error('Failed to load movie');
        navigate('/movies');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, date]);

  const handleBookNow = () => {
    if (!selectedShow) return toast.error('Please select a showtime first');
    if (!isAuthed) {
      toast.error('Please sign in to book tickets');
      return navigate('/login');
    }
    setMovie(movie);
    setShowtime(selectedShow);
    setDate(date);
    navigate(`/movies/${id}/seats`);
  };

  // Group showtimes by venue
  const grouped = showtimes.reduce((acc, s) => {
    const key = s.venue_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  if (loading) return <PageLoader message="Loading movie…" />;
  if (!movie)  return null;

  return (
    <div className="page-enter" style={{ minHeight: '100vh' }}>

      {/* ─── HERO BANNER ─────────────────────────────────────────────── */}
      <div style={{
        height: '66vh', position: 'relative',
        background: meta.grad, overflow: 'hidden',
      }}>
        {/* BG icon */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 120, opacity: 0.13,
          }}
        >{meta.icon}</motion.div>

        {/* Overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #07070f 15%, rgba(7,7,15,0.45) 60%, transparent)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,7,15,0.55), transparent 35%)' }}/>

        {/* Back button */}
        <button onClick={() => navigate('/movies')} style={{
          position: 'absolute', top: 76, left: 44,
          background: 'rgba(7,7,15,0.5)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          color: '#ede9e0', padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif', fontSize: 13,
          transition: 'all 0.2s',
        }}>← Back</button>

        {/* Title block */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          maxWidth: 1180, margin: '0 auto', padding: '0 44px 52px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{
              display: 'inline-block',
              background: 'rgba(240,192,64,0.1)',
              border: '1px solid rgba(240,192,64,0.3)',
              color: 'var(--gold)', fontSize: 10,
              padding: '4px 12px', borderRadius: 4,
              letterSpacing: 2.5, marginBottom: 12,
            }}>{meta.tag.toUpperCase()}</span>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 5.5vw, 70px)',
              fontWeight: 700, color: '#ede9e0',
              lineHeight: 1.08, marginBottom: 16,
            }}>{movie.title}</h1>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                background: 'linear-gradient(135deg,#f0c040,#d0901a)',
                color: '#06060c', fontWeight: 800,
                fontSize: 13, padding: '4px 10px', borderRadius: 5,
              }}>⭐ {movie.rating}/10</span>
              {movie.genre?.map((g) => (
                <span key={g} style={{ color: '#aaa8b8', fontSize: 13 }}>{g}</span>
              ))}
              <span style={{ color: '#444' }}>•</span>
              <span style={{ color: '#aaa8b8', fontSize: 13 }}>
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
              <span style={{ color: '#444' }}>•</span>
              <span style={{ color: '#aaa8b8', fontSize: 13 }}>{movie.language}</span>
              <span style={{ color: '#444' }}>•</span>
              <span style={{ color: '#aaa8b8', fontSize: 13 }}>{movie.release_year}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 44px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 370px', gap: 64 }}>

          {/* ─── LEFT ───────────────────────────────────────────────── */}
          <div>
            {/* Description */}
            <p style={{
              color: '#9896a8', lineHeight: 1.82,
              fontSize: 15, marginBottom: 44,
            }}>{movie.description}</p>

            {/* Pricing */}
            <div style={{ marginBottom: 44 }}>
              <div className="section-label" style={{ marginBottom: 18 }}>Ticket Pricing</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  ['🟢', 'Premium', selectedShow?.price_premium || '—', '#28a060'],
                  ['🟡', 'Gold',    selectedShow?.price_gold    || '—', 'var(--gold)'],
                  ['🔵', 'Silver',  selectedShow?.price_silver  || '—', '#7070a0'],
                ].map(([emoji, label, price, col]) => (
                  <div key={label} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 20px',
                    textAlign: 'center', flex: 1,
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>{label}</div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 28, fontWeight: 700, color: col,
                    }}>{price !== '—' ? `₹${price}` : '—'}</div>
                  </div>
                ))}
              </div>
              {!selectedShow && (
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>
                  ℹ️ Select a showtime to see exact pricing
                </p>
              )}
            </div>

            {/* Cast */}
            <div>
              <div className="section-label" style={{ marginBottom: 18 }}>Cast & Crew</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {['🧔', '👩', '🧓', '👨', '👩‍🦱', '🧑'].map((em, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 62, height: 62, borderRadius: '50%',
                      background: 'var(--surface-up)',
                      border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 28, marginBottom: 8,
                    }}>{em}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>Actor {i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ──────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{
              background: 'var(--surface)', borderRadius: 18,
              border: '1px solid var(--border)', padding: 28,
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26, color: '#ede9e0', marginBottom: 24,
              }}>Book Tickets</h3>

              {/* Date selector */}
              <div style={{ marginBottom: 22 }}>
                <label className="label">Select Date</label>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {DATES.map((d) => (
                    <button key={d.value}
                      className={`btn-outline ${date === d.value ? 'active' : ''}`}
                      style={{ padding: '7px 12px', fontSize: 12 }}
                      onClick={() => setDateLocal(d.value)}
                    >{d.label}</button>
                  ))}
                </div>
              </div>

              {/* Showtimes grouped by venue */}
              <div style={{ marginBottom: 28 }}>
                <label className="label">Select Showtime</label>

                {Object.keys(grouped).length === 0 ? (
                  <div style={{
                    color: 'var(--muted)', fontSize: 13,
                    textAlign: 'center', padding: '24px 0',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>😔</div>
                    No shows available on this date
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {Object.entries(grouped).map(([venueName, shows]) => (
                      <div key={venueName}>
                        <div style={{
                          color: 'var(--muted)', fontSize: 11,
                          fontWeight: 600, marginBottom: 8,
                        }}>📍 {venueName}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {shows.map((show) => (
                            <button key={show.showtime_id}
                              className={`btn-outline ${selectedShow?.showtime_id === show.showtime_id ? 'active' : ''}`}
                              style={{ padding: '8px 14px', fontSize: 13 }}
                              onClick={() => setSelectedShow(show)}
                            >{formatTime(show.show_time)}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected show summary */}
              {selectedShow && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(240,192,64,0.07)',
                    border: '1px solid rgba(240,192,64,0.2)',
                    borderRadius: 10, padding: '12px 16px',
                    marginBottom: 20, fontSize: 13,
                  }}
                >
                  <div style={{ color: '#ede9e0', fontWeight: 600, marginBottom: 4 }}>
                    {formatTime(selectedShow.show_time)}
                  </div>
                  <div style={{ color: 'var(--muted)' }}>{selectedShow.venue_name}</div>
                  <div style={{ color: 'var(--muted)' }}>{selectedShow.screen_name}</div>
                </motion.div>
              )}

              <button
                className="btn-gold"
                style={{
                  width: '100%', padding: 15, fontSize: 15,
                  opacity: selectedShow ? 1 : 0.45,
                  cursor: selectedShow ? 'pointer' : 'not-allowed',
                }}
                onClick={handleBookNow}
              >
                Select Seats →
              </button>

              {!selectedShow && (
                <p style={{
                  color: 'var(--muted)', fontSize: 11,
                  textAlign: 'center', marginTop: 10,
                }}>Select a showtime to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}