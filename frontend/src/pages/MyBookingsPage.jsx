import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/api';
import { formatDate, formatTime, formatCurrency } from '../utils/helpers';
import { PageLoader } from '../components/Loader';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getMyBookings();
        setBookings(res.data.bookings || []);
      } catch {
        toast.error('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter === 'all')       return true;
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  if (loading) return <PageLoader message="Loading your bookings…" />;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 90 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '44px 24px 88px' }}>

        {/* ─── HEADER ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.55 }}
          style={{ marginBottom: 36 }}
        >
          <div className="section-label">Your Tickets</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 52, fontWeight: 700, color: '#ede9e0',
          }}>My Bookings</h1>
        </motion.div>

        {/* ─── FILTERS ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 32 }}>
          {[
            ['all',       'All'],
            ['confirmed', '✅ Confirmed'],
            ['cancelled', '❌ Cancelled'],
          ].map(([val, label]) => (
            <button key={val}
              className={`btn-outline ${filter === val ? 'active' : ''}`}
              style={{ padding: '7px 18px' }}
              onClick={() => setFilter(val)}
            >{label}</button>
          ))}
        </div>

        {/* ─── EMPTY STATE ─────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <div style={{ fontSize: 56, marginBottom: 18 }}>🎟️</div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32, color: '#ede9e0', marginBottom: 10,
            }}>No Bookings Yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
              Your movie tickets will appear here after booking.
            </p>
            <button className="btn-gold"
              style={{ padding: '12px 28px' }}
              onClick={() => navigate('/movies')}
            >Browse Movies</button>
          </motion.div>
        )}

        {/* ─── BOOKING CARDS ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.map((booking, i) => (
            <motion.div key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              onClick={() => navigate(`/confirmation/${booking.id}`)}
              style={{
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                borderRadius: 16,
                padding:      '22px 26px',
                cursor:       'pointer',
                display:      'flex',
                gap:          22,
                alignItems:   'center',
                transition:   'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(240,192,64,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#1a1a2e,#2a2a4e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>🎬</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily:   "'Cormorant Garamond', serif",
                  fontSize:     22, fontWeight: 700,
                  color:        '#ede9e0', marginBottom: 5,
                  whiteSpace:   'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{booking.movie_title}</div>
                <div style={{
                  display: 'flex', gap: 16, flexWrap: 'wrap',
                  color: 'var(--muted)', fontSize: 12,
                }}>
                  <span>📅 {formatDate(booking.show_date)}</span>
                  <span>🕐 {formatTime(booking.show_time)}</span>
                  <span>🎭 {(booking.venue_name || '').split(',')[0]}</span>
                  <span>💺 {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</span>
                </div>
              </div>

              {/* Right side */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 700, color: 'var(--gold)',
                  marginBottom: 6,
                }}>{formatCurrency(booking.grand_total || booking.amount)}</div>
                <span style={{
                  display:      'inline-block',
                  background:   booking.status === 'confirmed'
                                  ? 'rgba(40,160,96,0.12)'
                                  : 'rgba(224,48,58,0.1)',
                  border:       `1px solid ${booking.status === 'confirmed'
                                  ? 'rgba(40,160,96,0.35)'
                                  : 'rgba(224,48,58,0.35)'}`,
                  color:        booking.status === 'confirmed' ? '#28a060' : '#e0303a',
                  fontSize:     11, fontWeight: 600,
                  padding:      '3px 10px', borderRadius: 4,
                }}>
                  {booking.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}