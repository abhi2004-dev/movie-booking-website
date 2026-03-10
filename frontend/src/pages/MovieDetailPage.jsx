import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { movieAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { getMovieMeta, formatTime, daysFromNow, getDayLabel } from '../utils/helpers';
import { PageLoader } from '../components/Loader';
import toast from 'react-hot-toast';

const DATES = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
  label: getDayLabel(daysFromNow(d)),
  value: daysFromNow(d),
}));

export default function MovieDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { setMovie, setShowtime, setVenue, setDate, isAuthed } = useBooking();

  const [movie,        setMovieData]    = useState(null);
  const [showtimes,    setShowtimes]    = useState([]);
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await movieAPI.getById(id);
        setMovieData(res.data.movie);
      } catch {
        toast.error('Movie not found');
        navigate('/movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!id) return;
      try {
        const res = await movieAPI.getShowtimes(id, selectedDate);
        const all = res.data.movie?.showtimes || res.data.showtimes || [];
        setShowtimes(all);
      } catch {
        setShowtimes([]);
      }
    };
    fetchShowtimes();
  }, [id, selectedDate]);

  const handleBookShowtime = (showtime) => {
    if (!isAuthed) {
      toast.error('Please sign in to book tickets');
      navigate('/login');
      return;
    }
    setMovie(movie);
    setShowtime(showtime);
    setVenue({ id: showtime.venue_id, name: showtime.venue_name });
    setDate(selectedDate);
    navigate(`/movies/${id}/seats?showtime=${showtime.showtime_id}`);
  };

  if (loading) return <PageLoader message="Loading movie…" />;
  if (!movie)  return null;

  const meta = getMovieMeta(movie.id);

  const grouped = showtimes.reduce((acc, s) => {
    const key = s.venue_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: 520,
        overflow: 'hidden', display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: meta.grad, opacity: 0.7 }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #07070f 30%, transparent 100%)',
        }}/>
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 180, opacity: 0.08,
          }}
        >{meta.icon}</motion.div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1180, margin: '0 auto',
          padding: '0 44px 48px', width: '100%',
          display: 'flex', gap: 36, alignItems: 'flex-end',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7 }}
            style={{
              width: 150, height: 220, borderRadius: 14, flexShrink: 0,
              background: meta.grad, border: '1px solid rgba(240,192,64,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 60, overflow: 'hidden',
            }}
          >{meta.icon}</motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span style={{
              background: 'linear-gradient(135deg,#f0c040,#d0901a)',
              color: '#06060c', fontWeight: 800,
              fontSize: 11, padding: '3px 10px', borderRadius: 4,
              display: 'inline-block', marginBottom: 12,
            }}>{meta.tag}</span>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 700, color: '#ede9e0',
              lineHeight: 1.1, marginBottom: 14,
            }}>{movie.title}</h1>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: 'linear-gradient(135deg,#f0c040,#d0901a)',
                color: '#06060c', fontWeight: 800,
                fontSize: 13, padding: '4px 10px', borderRadius: 5,
              }}>⭐ {movie.rating}/10</span>
              {movie.genre?.map((g) => (
                <span key={g} style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ede9e0', fontSize: 12,
                  padding: '4px 10px', borderRadius: 5,
                }}>{g}</span>
              ))}
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>🌐 {movie.language}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>📅 {movie.release_year}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── BODY ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 44px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 44 }}>

          {/* ─── LEFT ──────────────────────────────────────────────── */}
          <div>
            <div style={{ marginBottom: 44 }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28, color: '#ede9e0', marginBottom: 14,
              }}>About the Film</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: 15 }}>
                {movie.description}
              </p>
            </div>

            {/* DATE SELECTOR */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28, color: '#ede9e0', marginBottom: 18,
              }}>Select Date</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {DATES.map((d) => (
                  <button key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    style={{
                      padding: '10px 18px', borderRadius: 10,
                      border: `1.5px solid ${selectedDate === d.value ? 'var(--gold)' : 'var(--border)'}`,
                      background: selectedDate === d.value ? 'rgba(240,192,64,0.1)' : 'var(--surface)',
                      color: selectedDate === d.value ? 'var(--gold)' : 'var(--muted)',
                      cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                      fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 10 }}>{d.value.slice(5).replace('-', '/')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SHOWTIMES */}
            <div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28, color: '#ede9e0', marginBottom: 18,
              }}>Showtimes</h2>

              {Object.keys(grouped).length === 0 ? (
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '40px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎭</div>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                    No shows available for this date.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
                    Try selecting a different date.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {Object.entries(grouped).map(([venueName, shows]) => (
                    <div key={venueName} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '22px 24px',
                    }}>
                      <div style={{ fontWeight: 600, color: '#ede9e0', fontSize: 16, marginBottom: 4 }}>
                        🎭 {venueName}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 16 }}>
                        {shows[0]?.city}
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {shows.map((s) => (
                          <button key={s.showtime_id}
                            onClick={() => handleBookShowtime(s)}
                            style={{
                              padding: '10px 18px', borderRadius: 9,
                              border: '1.5px solid rgba(240,192,64,0.3)',
                              background: 'rgba(240,192,64,0.06)',
                              color: 'var(--gold)', cursor: 'pointer',
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(240,192,64,0.15)';
                              e.currentTarget.style.borderColor = 'var(--gold)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(240,192,64,0.06)';
                              e.currentTarget.style.borderColor = 'rgba(240,192,64,0.3)';
                            }}
                          >
                            {formatTime(s.show_time)}
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontWeight: 400 }}>
                              {s.screen_name}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div style={{
                        display: 'flex', gap: 16, marginTop: 14,
                        paddingTop: 14, borderTop: '1px solid var(--border)',
                      }}>
                        {[
                          ['Premium', shows[0]?.price_premium],
                          ['Gold',    shows[0]?.price_gold],
                          ['Silver',  shows[0]?.price_silver],
                        ].map(([cat, price]) => (
                          <span key={cat} style={{ color: 'var(--muted)', fontSize: 12 }}>
                            {cat}: <span style={{ color: '#ede9e0' }}>₹{price}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ─────────────────────────────────────── */}
          <div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px',
              position: 'sticky', top: 84,
            }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, color: '#ede9e0', marginBottom: 18,
              }}>Movie Info</h3>

              {[
                ['Director', movie.director  || '—'],
                ['Cast',     movie.cast?.join(', ') || '—'],
                ['Language', movie.language],
                ['Duration', `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`],
                ['Released', movie.release_year],
                ['Rating',   `${movie.rating} / 10`],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12,
                }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#ede9e0', fontSize: 13, textAlign: 'right', wordBreak: 'break-word' }}>
                    {value}
                  </span>
                </div>
              ))}

              <button className="btn-gold"
                style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 22 }}
                onClick={() => {
                  if (showtimes.length > 0) handleBookShowtime(showtimes[0]);
                  else toast.error('No shows available for this date');
                }}
              >🎟️ Book Tickets</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}