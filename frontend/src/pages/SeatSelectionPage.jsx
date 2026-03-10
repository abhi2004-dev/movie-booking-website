import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI, movieAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import useSocket from '../hooks/useSocket';
import SeatGrid from '../components/SeatGrid';
import { PageLoader } from '../components/Loader';
import {
  formatTime, formatDate, formatCurrency,
  calcFee, calcGrandTotal, calcSeatsTotal,
  getSeatCategory, getSeatPrice,
} from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SeatSelectionPage() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const showtimeId    = params.get('showtime');

  const {
    selectedMovie, selectedShowtime, selectedDate,
    setSeats, setBooking, setOrder,
  } = useBooking();

  const [seatStatus,    setSeatStatus]    = useState({ booked: [], locked: [] });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [pricing,       setPricing]       = useState({});
  const [loading,       setLoading]       = useState(true);
  const [locking,       setLocking]       = useState(false);

  // ─── SOCKET ─────────────────────────────────────────────────────────────
  const { joinShowtime, leaveShowtime, lockSeats, unlockSeats } = useSocket({
    onSeatsLocked: useCallback(({ seats }) => {
      setSeatStatus((prev) => ({
        ...prev,
        locked: [...new Set([...prev.locked, ...seats])],
      }));
    }, []),
    onSeatsUnlocked: useCallback(({ seats }) => {
      setSeatStatus((prev) => ({
        ...prev,
        locked: prev.locked.filter((s) => !seats.includes(s)),
      }));
    }, []),
    onSeatsConfirmed: useCallback(({ seats }) => {
      setSeatStatus((prev) => ({
        ...prev,
        booked: [...new Set([...prev.booked, ...seats])],
        locked: prev.locked.filter((s) => !seats.includes(s)),
      }));
    }, []),
  });

  // ─── FETCH SEAT STATUS ────────────────────────────────────────────────
  useEffect(() => {
    if (!showtimeId) {
      toast.error('Invalid showtime');
      navigate('/movies');
      return;
    }

    const fetchSeats = async () => {
  try {
    console.log('Fetching seats for showtime:', showtimeId);
    const res = await bookingAPI.getSeatAvailability(showtimeId);
    console.log('Seat response:', res.data);
    setSeatStatus({
      booked: res.data.booked_seats || [],
      locked: res.data.locked_seats || [],
    });
    setPricing({
      price_premium: res.data.pricing?.premium,
      price_gold:    res.data.pricing?.gold,
      price_silver:  res.data.pricing?.silver,
    });
  } catch (err) {
    console.error('Seat fetch error:', err);
    toast.error('Failed to load seats');
  } finally {
    setLoading(false);
  }
};

    fetchSeats();
    joinShowtime(showtimeId);
    return () => leaveShowtime(showtimeId);
  }, [showtimeId]);

  // ─── SEAT CLICK ──────────────────────────────────────────────────────
  const handleSeatClick = (seatCode) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) return prev.filter((s) => s !== seatCode);
      if (prev.length >= 8) { toast.error('Max 8 seats per booking'); return prev; }
      return [...prev, seatCode];
    });
  };

  // ─── PROCEED ─────────────────────────────────────────────────────────
  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setLocking(true);
    try {
      await bookingAPI.lockSeats({ showtime_id: showtimeId, seats: selectedSeats });
      lockSeats(showtimeId, selectedSeats);
      setSeats(selectedSeats);
      navigate('/payment');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to lock seats');
    } finally {
      setLocking(false);
    }
  };

  // ─── CLEAR ───────────────────────────────────────────────────────────
  const handleClear = () => {
    setSelectedSeats([]);
  };

  if (loading) return <PageLoader message="Loading seats…" />;

  const subtotal   = calcSeatsTotal(selectedSeats, pricing);
  const fee        = calcFee(subtotal);
  const grandTotal = subtotal + fee;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 88px' }}>

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--muted)', cursor: 'pointer',
              fontSize: 13, marginBottom: 16,
              fontFamily: 'Outfit, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >← Back</button>

          <div className="section-label">Select Your Seats</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 44, fontWeight: 700, color: '#ede9e0',
          }}>{selectedMovie?.title || 'Choose Seats'}</h1>

          {/* Show info */}
          {selectedShowtime && (
            <div style={{
              display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap',
            }}>
              {[
                ['📅', formatDate(selectedDate)],
                ['🕐', formatTime(selectedShowtime.show_time)],
                ['🎭', (selectedShowtime.venue_name || '').split(',')[0]],
                ['🎬', selectedShowtime.screen_name],
              ].map(([icon, val]) => (
                <span key={val} style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {icon} {val}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── MAIN LAYOUT ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 36 }}>

          {/* ─── SEAT GRID ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 18, padding: '36px 24px',
              overflowX:    'auto',
            }}
          >
            <SeatGrid
              bookedSeats={seatStatus.booked}
              lockedSeats={seatStatus.locked}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
              pricing={pricing}
            />
          </motion.div>

          {/* ─── SUMMARY ─────────────────────────────────────────────── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                borderRadius: 18, padding: '24px',
                position:     'sticky', top: 88,
              }}
            >
              <h3 style={{
                fontFamily:   "'Cormorant Garamond', serif",
                fontSize:     22, color: '#ede9e0', marginBottom: 20,
              }}>Booking Summary</h3>

              {/* Selected seats */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  color: 'var(--muted)', fontSize: 11,
                  letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
                }}>Selected Seats</div>

                {selectedSeats.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                    Click seats on the grid to select
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedSeats.map((s) => (
                      <span key={s} style={{
                        background:   'rgba(240,192,64,0.1)',
                        border:       '1px solid rgba(240,192,64,0.3)',
                        color:        'var(--gold)',
                        fontSize:     12, fontWeight: 600,
                        padding:      '3px 9px', borderRadius: 5,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Seat breakdown */}
              {selectedSeats.length > 0 && (
                <div style={{
                  borderTop:  '1px solid var(--border)',
                  paddingTop: 16, marginBottom: 16,
                }}>
                  {selectedSeats.map((s) => {
                    const cat   = getSeatCategory(s[0]);
                    const price = getSeatPrice(s[0], pricing);
                    return (
                      <div key={s} style={{
                        display:        'flex',
                        justifyContent: 'space-between',
                        marginBottom:   6,
                      }}>
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                          Seat {s} <span style={{ fontSize: 10 }}>({cat})</span>
                        </span>
                        <span style={{ color: '#ede9e0', fontSize: 12 }}>
                          ₹{price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Totals */}
              {selectedSeats.length > 0 && (
                <div style={{
                  borderTop:  '1px solid var(--border)',
                  paddingTop: 16, marginBottom: 20,
                }}>
                  {[
                    ['Subtotal',        formatCurrency(subtotal)],
                    ['Convenience Fee', formatCurrency(fee)],
                  ].map(([label, val]) => (
                    <div key={label} style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      marginBottom:   8,
                    }}>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
                      <span style={{ color: '#ede9e0', fontSize: 13 }}>{val}</span>
                    </div>
                  ))}
                  <div style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    marginTop:      10, paddingTop: 10,
                    borderTop:      '1px solid var(--border)',
                  }}>
                    <span style={{ color: '#ede9e0', fontWeight: 600 }}>Total</span>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22, fontWeight: 700, color: 'var(--gold)',
                    }}>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn-gold"
                  style={{ width: '100%', padding: 14, fontSize: 15 }}
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0 || locking}
                >
                  {locking ? '⏳ Locking Seats…' : `🎟️ Proceed to Payment`}
                </button>

                {selectedSeats.length > 0 && (
                  <button className="btn-ghost"
                    style={{ width: '100%', padding: 12, fontSize: 13 }}
                    onClick={handleClear}
                  >Clear Selection</button>
                )}
              </div>

              {/* Timer warning */}
              {selectedSeats.length > 0 && (
                <p style={{
                  color: 'var(--muted)', fontSize: 11,
                  textAlign: 'center', marginTop: 14, lineHeight: 1.6,
                }}>
                  ⏱️ Seats are held for 10 minutes after locking
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}