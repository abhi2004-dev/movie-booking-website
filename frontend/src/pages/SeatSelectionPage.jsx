import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { bookingAPI } from '../services/api';
import SeatGrid from '../components/SeatGrid';
import { PageLoader } from '../components/Loader';
import {
  formatTime, formatDate, calcSeatsTotal,
  calcFee, calcGrandTotal, formatCurrency, sortSeats,
} from '../utils/helpers';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

export default function SeatSelectionPage() {
  const navigate  = useNavigate();
  const {
    selectedMovie, selectedShowtime, selectedDate,
    setSeats, user,
  } = useBooking();

  const [bookedSeats,  setBookedSeats]  = useState([]);
  const [lockedSeats,  setLockedSeats]  = useState([]);
  const [selectedSts,  setSelectedSts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [locking,      setLocking]      = useState(false);

  // ─── REDIRECT IF NO SHOWTIME SELECTED ────────────────────────────────
  useEffect(() => {
    if (!selectedMovie || !selectedShowtime) {
      toast.error('Please select a movie and showtime first');
      navigate('/movies');
    }
  }, []);

  // ─── FETCH SEAT AVAILABILITY ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedShowtime?.showtime_id) return;
    const fetchSeats = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getSeatAvailability(selectedShowtime.showtime_id);
        setBookedSeats(res.data.booked_seats || []);
        setLockedSeats(res.data.locked_seats || []);
      } catch {
        toast.error('Failed to load seat availability');
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [selectedShowtime]);

  // ─── REAL-TIME SOCKET ─────────────────────────────────────────────────
  const { lockSeats: socketLock, unlockSeats: socketUnlock } = useSocket(
    selectedShowtime?.showtime_id,
    {
      onSeatsLocked: (seats) => {
        setLockedSeats((prev) => [...new Set([...prev, ...seats])]);
      },
      onSeatsUnlocked: (seats) => {
        setLockedSeats((prev) => prev.filter((s) => !seats.includes(s)));
      },
      onSeatsConfirmed: (seats) => {
        setBookedSeats((prev) => [...new Set([...prev, ...seats])]);
        setLockedSeats((prev) => prev.filter((s) => !seats.includes(s)));
      },
    }
  );

  // ─── SEAT CLICK ───────────────────────────────────────────────────────
  const handleSeatClick = (seatCode) => {
    setSelectedSts((prev) => {
      if (prev.includes(seatCode)) return prev.filter((s) => s !== seatCode);
      if (prev.length >= 10) {
        toast.error('Maximum 10 seats per booking');
        return prev;
      }
      return [...prev, seatCode];
    });
  };

  // ─── PROCEED TO PAYMENT ───────────────────────────────────────────────
  const handleProceed = async () => {
    if (selectedSts.length === 0) return toast.error('Please select at least one seat');
    setLocking(true);
    try {
      // Lock seats via API
      await bookingAPI.lockSeats({
        showtimeId: selectedShowtime.showtime_id,
        seatCodes:  selectedSts,
      });

      // Also emit via socket so other users see immediately
      socketLock(selectedSts, user?.id);

      // Save to context
      setSeats(selectedSts);

      toast.success(`${selectedSts.length} seat${selectedSts.length > 1 ? 's' : ''} locked for 10 minutes!`);
      navigate('/payment');

    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to lock seats';
      toast.error(msg);
    } finally {
      setLocking(false);
    }
  };

  // ─── GO BACK — unlock seats ───────────────────────────────────────────
  const handleBack = () => {
    if (selectedSts.length > 0) {
      socketUnlock(selectedSts);
    }
    navigate(`/movies/${selectedMovie?.id}`);
  };

  if (loading) return <PageLoader message="Loading seats…" />;
  if (!selectedMovie || !selectedShowtime) return null;

  const pricing = {
    premium: selectedShowtime.price_premium,
    gold:    selectedShowtime.price_gold,
    silver:  selectedShowtime.price_silver,
  };
  const subtotal  = calcSeatsTotal(selectedSts, pricing);
  const fee       = calcFee(subtotal);
  const grandTotal= calcGrandTotal(subtotal);
  const sorted    = sortSeats(selectedSts);

  return (
    <div className="page-enter" style={{ minHeight: '100vh', paddingTop: 72 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 44px 88px' }}>

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <button onClick={handleBack} style={{
          background: 'none', border: 'none',
          color: 'var(--muted)', cursor: 'pointer',
          fontSize: 13, fontFamily: 'Outfit, sans-serif',
          marginBottom: 14,
        }}>← Back to {selectedMovie.title}</button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 42, color: '#ede9e0', marginBottom: 4,
          }}>{selectedMovie.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 40 }}>
            {formatDate(selectedDate)} · {formatTime(selectedShowtime.show_time)} · {selectedShowtime.venue_name?.split(',')[0]} · {selectedShowtime.screen_name}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 52 }}>

          {/* ─── SEAT GRID ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SeatGrid
              bookedSeats={bookedSeats}
              lockedSeats={lockedSeats}
              selectedSeats={selectedSts}
              onSeatClick={handleSeatClick}
              pricing={pricing}
              disabled={locking}
            />
          </motion.div>

          {/* ─── SUMMARY SIDEBAR ─────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'var(--surface)', borderRadius: 16,
                border: '1px solid var(--border)', padding: 22,
              }}
            >
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, color: '#ede9e0', marginBottom: 18,
              }}>Your Selection</h3>

              {/* Show info */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#ede9e0', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                  {selectedMovie.title}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {formatTime(selectedShowtime.show_time)} · {formatDate(selectedDate)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {selectedShowtime.venue_name?.split(',')[0]}
                </div>
              </div>

              {selectedSts.length > 0 ? (
                <>
                  {/* Selected seats */}
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 14, marginBottom: 14,
                  }}>
                    <label className="label">Selected Seats</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {sorted.map((s) => (
                        <span key={s} style={{
                          background: 'rgba(240,192,64,0.1)',
                          border: '1px solid rgba(240,192,64,0.28)',
                          color: 'var(--gold)', fontSize: 11,
                          padding: '2px 7px', borderRadius: 4,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 13, marginBottom: 18,
                  }}>
                    {sorted.map((s) => {
                      const row = s[0];
                      const cat = ['A','B'].includes(row) ? 'premium' : ['C','D','E','F','G'].includes(row) ? 'gold' : 'silver';
                      return (
                        <div key={s} style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 5,
                        }}>
                          <span style={{ color: 'var(--muted)' }}>Seat {s} ({cat})</span>
                          <span style={{ color: '#ede9e0' }}>{formatCurrency(pricing[cat])}</span>
                        </div>
                      );
                    })}
                    <div style={{
                      borderTop: '1px solid var(--border)',
                      marginTop: 9, paddingTop: 9,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ color: '#ede9e0', fontWeight: 700, fontSize: 13 }}>Subtotal</span>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 24, fontWeight: 700, color: 'var(--gold)',
                      }}>{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <button
                    className="btn-gold"
                    style={{ width: '100%', padding: 13, fontSize: 13 }}
                    onClick={handleProceed}
                    disabled={locking}
                  >
                    {locking ? '🔒 Locking Seats…' : 'Proceed to Payment →'}
                  </button>
                </>
              ) : (
                <div style={{
                  color: 'var(--muted)', fontSize: 13,
                  textAlign: 'center', padding: '22px 0',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🪑</div>
                  Tap seats to select them
                </div>
              )}
            </motion.div>

            {selectedSts.length > 0 && (
              <p style={{
                color: 'var(--muted)', fontSize: 11,
                textAlign: 'center', marginTop: 10,
              }}>🔒 Seats held 10 mins once you proceed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}