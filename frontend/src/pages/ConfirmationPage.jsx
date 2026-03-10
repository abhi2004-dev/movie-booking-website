import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/api';
import TicketCard from '../components/TicketCard';
import { PageLoader } from '../components/Loader';
import { formatCurrency, calcFee } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ConfirmationPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [booking,  setBooking]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  // ─── FETCH BOOKING ────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getById(id);
        setBooking(res.data.booking);
      } catch {
        toast.error('Booking not found');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading)  return <PageLoader message="Loading your ticket…" />;
  if (!booking) return null;

  const grandTotal = Number(booking.grand_total);

  return (
    <div className="page-enter" style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '100px 20px',
    }}>
      <div style={{ maxWidth: 460, width: '100%' }}>

        {/* ─── SUCCESS HEADER ──────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0   }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 62, marginBottom: 12 }}
          >🎉</motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily:  "'Cormorant Garamond', serif",
              fontSize:    46, color: '#ede9e0', marginBottom: 8,
            }}
          >Booking Confirmed!</motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            style={{ color: 'var(--muted)', fontSize: 14 }}
          >
            Your tickets are ready. Enjoy the show! 🍿
          </motion.p>
        </div>

        {/* ─── TICKET ──────────────────────────────────────────────── */}
        <TicketCard booking={booking} animate={true} />

        {/* ─── BOOKING DETAILS ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background:   'var(--surface)',
            borderRadius: 14,
            border:       '1px solid var(--border)',
            padding:      '18px 22px',
            marginTop:    16,
          }}
        >
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   12,
          }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Payment ID</span>
            <span style={{
              color:      'var(--gold)', fontSize: 12,
              fontWeight: 600, letterSpacing: 0.5,
            }}>{booking.payment_id || '—'}</span>
          </div>
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   12,
          }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Booking Status</span>
            <span style={{
              background:   'rgba(40,160,96,0.12)',
              border:       '1px solid rgba(40,160,96,0.35)',
              color:        '#28a060',
              fontSize:     11, fontWeight: 600,
              padding:      '2px 10px', borderRadius: 5,
            }}>✅ Confirmed</span>
          </div>
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
          }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Amount Paid</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize:   22, fontWeight: 700, color: 'var(--gold)',
            }}>{formatCurrency(grandTotal)}</span>
          </div>
        </motion.div>

        {/* ─── CONFIRMATION EMAIL NOTE ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          style={{
            textAlign:  'center',
            marginTop:  16,
            color:      'var(--muted)',
            fontSize:   12,
            lineHeight: 1.6,
          }}
        >
          📧 A confirmation has been sent to <span style={{ color: '#ede9e0' }}>{booking.user_email}</span>
        </motion.div>

        {/* ─── ACTION BUTTONS ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5, delay: 0.65 }}
          style={{ display: 'flex', gap: 12, marginTop: 24 }}
        >
          <button
            className="btn-gold"
            style={{ flex: 1, padding: 14, fontSize: 14 }}
            onClick={() => navigate('/bookings')}
          >📋 My Bookings</button>

          <button
            className="btn-ghost"
            style={{ flex: 1, padding: 14, fontSize: 14 }}
            onClick={() => navigate('/')}
          >🏠 Home</button>
        </motion.div>

        {/* ─── BOOK ANOTHER ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          style={{ textAlign: 'center', marginTop: 16 }}
        >
          <span
            onClick={() => navigate('/movies')}
            style={{
              color:      'var(--gold)',
              fontSize:   13, cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = 0.7}
            onMouseLeave={(e) => e.target.style.opacity = 1}
          >
            🎬 Book Another Movie →
          </span>
        </motion.div>

      </div>
    </div>
  );
}