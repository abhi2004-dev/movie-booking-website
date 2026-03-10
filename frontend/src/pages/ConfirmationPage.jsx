import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/api';
import TicketCard from '../components/TicketCard';
import { PageLoader } from '../components/Loader';
import toast from 'react-hot-toast';

export default function ConfirmationPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
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
    fetchBooking();
  }, [id]);

  if (loading) return <PageLoader message="Loading your ticket…" />;
  if (!booking) return null;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '44px 24px 88px' }}>

        {/* ─── SUCCESS HEADER ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 44 }}
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width:          72, height: 72,
              borderRadius:   '50%',
              background:     'linear-gradient(135deg,#28a060,#1a7040)',
              display:        'flex', alignItems: 'center', justifyContent: 'center',
              fontSize:       34, margin: '0 auto 22px',
              boxShadow:      '0 0 40px rgba(40,160,96,0.4)',
            }}
          >✅</motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              fontFamily:  "'Cormorant Garamond', serif",
              fontSize:    52, fontWeight: 700,
              color:       '#ede9e0', marginBottom: 10,
            }}
          >Booking Confirmed!</motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}
          >
            Your tickets have been booked successfully.<br />
            Show the QR code at the entrance — enjoy the show! 🎬
          </motion.p>
        </motion.div>

        {/* ─── TICKET CARD ───────────────────────────────────────────── */}
        <TicketCard booking={booking} animate={true} />

        {/* ─── ACTIONS ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            display:        'flex',
            gap:            12,
            marginTop:      28,
            justifyContent: 'center',
            flexWrap:       'wrap',
          }}
        >
          <button
            className="btn-gold"
            style={{ padding: '13px 28px', fontSize: 14 }}
            onClick={() => navigate('/bookings')}
          >🎟️ My Bookings</button>

          <button
            className="btn-ghost"
            style={{ padding: '13px 28px', fontSize: 14 }}
            onClick={() => navigate('/movies')}
          >🎬 Book Another</button>
        </motion.div>

        {/* ─── INFO CARDS ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 14,
            marginTop:           36,
          }}
        >
          {[
            {
              icon:  '📱',
              title: 'E-Ticket Ready',
              desc:  'Your ticket is saved in My Bookings. No printout needed.',
            },
            {
              icon:  '⏰',
              title: 'Arrive Early',
              desc:  'Please arrive 15 minutes before showtime for a smooth entry.',
            },
            {
              icon:  '🔒',
              title: 'Secure Booking',
              desc:  'Your payment was processed securely via Razorpay.',
            },
            {
              icon:  '❌',
              title: 'Cancellation',
              desc:  'Cancel up to 2 hours before showtime from My Bookings.',
            },
          ].map((card) => (
            <div key={card.title} style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 12, padding: '18px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
              <div style={{
                color: '#ede9e0', fontWeight: 600,
                fontSize: 13, marginBottom: 5,
              }}>{card.title}</div>
              <div style={{
                color: 'var(--muted)', fontSize: 12, lineHeight: 1.6,
              }}>{card.desc}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}