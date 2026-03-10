import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingAPI } from '../services/api';
import TicketCard from '../components/TicketCard';
import { PageLoader, SkeletonBlock } from '../components/Loader';
import { formatDate, formatTime, formatCurrency, getMovieMeta } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const navigate          = useNavigate();
  const { id }            = useParams();
  const [bookings,  setBookings]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [cancelling,setCancelling]= useState(null);
  const [filter,    setFilter]    = useState('all'); // all | confirmed | cancelled

  // ─── FETCH ALL BOOKINGS ───────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getAll();
        setBookings(res.data.bookings);

        // If URL has a booking id, auto-select it
        if (id) {
          const found = res.data.bookings.find((b) => b.id === id);
          if (found) setSelected(found);
        }
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ─── CANCEL BOOKING ───────────────────────────────────────────────────
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingAPI.cancel(bookingId);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      if (selected?.id === bookingId) {
        setSelected((prev) => ({ ...prev, status: 'cancelled' }));
      }
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'all')       return true;
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  if (loading) return <PageLoader message="Loading your bookings…" />;

  // ─── EMPTY STATE ──────────────────────────────────────────────────────
  if (bookings.length === 0) return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexDirection:  'column',
      gap:            18, paddingTop: 76,
      textAlign:      'center', padding: '0 20px',
    }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 72 }}
      >🎟️</motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 42, color: '#ede9e0',
        }}
      >No Bookings Yet</motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ color: 'var(--muted)', maxWidth: 320, lineHeight: 1.6 }}
      >
        You haven't booked any tickets yet. Find a movie you love and grab your seats!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button
          className="btn-gold"
          style={{ padding: '13px 32px', fontSize: 15, marginTop: 8 }}
          onClick={() => navigate('/movies')}
        >🎬 Browse Movies</button>
      </motion.div>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', paddingTop: 90 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 44px 88px' }}>

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 36 }}
        >
          <div className="section-label">Your Tickets</div>
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            flexWrap:       'wrap', gap: 16,
          }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 52, fontWeight: 700, color: '#ede9e0',
            }}>My Bookings</h1>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                ['all',       'All'],
                ['confirmed', '✅ Confirmed'],
                ['cancelled', '❌ Cancelled'],
              ].map(([val, label]) => (
                <button key={val}
                  className={`btn-outline ${filter === val ? 'active' : ''}`}
                  style={{ padding: '6px 16px', fontSize: 12 }}
                  onClick={() => setFilter(val)}
                >{label}</button>
              ))}
            </div>
          </div>

          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{filtered.length}</span> booking{filtered.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 32 }}>

          {/* ─── BOOKINGS LIST ───────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {filtered.map((b, i) => {
                const meta       = getMovieMeta(b.movie_id);
                const isSelected = selected?.id === b.id;

                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    onClick={() => setSelected(isSelected ? null : b)}
                    style={{
                      background:   isSelected ? 'var(--surface-up)' : 'var(--surface)',
                      borderRadius: 14,
                      border:       `1px solid ${isSelected ? 'rgba(240,192,64,0.3)' : 'var(--border)'}`,
                      overflow:     'hidden',
                      display:      'flex',
                      cursor:       'pointer',
                      transition:   'all 0.22s ease',
                      boxShadow:    isSelected ? '0 0 0 1px rgba(240,192,64,0.15)' : 'none',
                    }}
                  >
                    {/* Poster strip */}
                    <div style={{
                      width:      100, flexShrink: 0,
                      background: meta.grad,
                      display:    'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 38,
                    }}>{meta.icon}</div>

                    {/* Info */}
                    <div style={{ padding: '18px 22px', flex: 1 }}>
                      <div style={{
                        display:        'flex',
                        justifyContent: 'space-between',
                        alignItems:     'flex-start',
                        marginBottom:   8,
                      }}>
                        <div>
                          <h3 style={{
                            fontFamily:  "'Cormorant Garamond', serif",
                            fontSize:    20, color: '#ede9e0', marginBottom: 3,
                          }}>{b.movie_title}</h3>
                          <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                            {formatDate(b.show_date)} · {formatTime(b.show_time)}
                          </p>
                          <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                            {b.venue_name?.split(',')[0]} · {b.screen_name}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display:      'inline-block',
                            background:   b.status === 'confirmed'
                                            ? 'rgba(40,160,96,0.12)'
                                            : 'rgba(224,48,58,0.1)',
                            border:       `1px solid ${b.status === 'confirmed'
                                            ? 'rgba(40,160,96,0.35)'
                                            : 'rgba(224,48,58,0.35)'}`,
                            color:        b.status === 'confirmed' ? '#28a060' : '#e0303a',
                            fontSize:     10, fontWeight: 600,
                            padding:      '2px 9px', borderRadius: 4,
                            marginBottom: 6,
                          }}>
                            {b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                          </span>
                          <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize:   22, fontWeight: 700, color: 'var(--gold)',
                          }}>{formatCurrency(Number(b.grand_total))}</div>
                        </div>
                      </div>

                      {/* Seats + actions */}
                      <div style={{
                        display:     'flex',
                        gap:         5,
                        alignItems:  'center',
                        flexWrap:    'wrap',
                        marginTop:   10,
                      }}>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>Seats:</span>
                        {(b.seats || []).map((s) => (
                          <span key={s} style={{
                            background:   'rgba(240,192,64,0.09)',
                            border:       '1px solid rgba(240,192,64,0.22)',
                            color:        'var(--gold)', fontSize: 10,
                            padding:      '2px 6px', borderRadius: 3,
                          }}>{s}</span>
                        ))}
                        <span style={{
                          marginLeft: 'auto', color: 'var(--muted)',
                          fontSize: 10,
                        }}>ID: {b.id?.slice(0, 8).toUpperCase()}</span>
                      </div>

                      {/* Cancel button */}
                      {b.status === 'confirmed' && (
                        <div style={{ marginTop: 12 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}
                            disabled={cancelling === b.id}
                            style={{
                              background:   'rgba(224,48,58,0.08)',
                              border:       '1px solid rgba(224,48,58,0.25)',
                              borderRadius: 6, color: '#e0303a',
                              padding:      '5px 14px', fontSize: 11,
                              cursor:       'pointer',
                              fontFamily:   'Outfit, sans-serif',
                              transition:   'all 0.2s',
                              opacity:      cancelling === b.id ? 0.5 : 1,
                            }}
                          >
                            {cancelling === b.id ? 'Cancelling…' : '✕ Cancel Booking'}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p>No {filter} bookings found.</p>
              </div>
            )}
          </div>

          {/* ─── TICKET DETAIL ───────────────────────────────────────── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: 30  }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'sticky', top: 84, height: 'fit-content' }}
              >
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  marginBottom:   16,
                }}>
                  <span style={{
                    color:         'var(--gold)', fontSize: 11,
                    fontWeight:    700, letterSpacing: 2.5,
                    textTransform: 'uppercase',
                  }}>Ticket Preview</span>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background:   'rgba(255,255,255,0.06)',
                      border:       '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6, color: 'var(--muted)',
                      padding:      '4px 10px', fontSize: 12,
                      cursor:       'pointer',
                      fontFamily:   'Outfit, sans-serif',
                    }}
                  >✕ Close</button>
                </div>
                <TicketCard booking={selected} animate={false} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}