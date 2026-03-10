import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { bookingAPI, paymentAPI, openRazorpay } from '../services/api';
import { PaymentLoader } from '../components/Loader';
import {
  formatTime, formatDate, formatCurrency,
  calcFee, calcGrandTotal, sortSeats,
  calcSeatsTotal, isValidEmail, isValidPhone,
} from '../utils/helpers';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const navigate = useNavigate();
  const {
    selectedMovie, selectedShowtime, selectedSeats,
    selectedDate, setBooking, setOrder, clearBooking, user,
  } = useBooking();

  const [name,       setName]       = useState(user?.name  || '');
  const [email,      setEmail]      = useState(user?.email || '');
  const [phone,      setPhone]      = useState(user?.phone || '');
  const [processing, setProcessing] = useState(false);

  // ─── REDIRECT IF NO SEATS SELECTED ───────────────────────────────────
  useEffect(() => {
    if (!selectedMovie || !selectedShowtime || !selectedSeats?.length) {
      toast.error('Please select seats first');
      navigate('/movies');
    }
  }, []);

  if (!selectedMovie || !selectedShowtime || !selectedSeats?.length) return null;

  const pricing = {
    premium: selectedShowtime.price_premium,
    gold:    selectedShowtime.price_gold,
    silver:  selectedShowtime.price_silver,
  };

  const subtotal  = calcSeatsTotal(selectedSeats, pricing);
  const fee       = calcFee(subtotal);
  const grandTotal= calcGrandTotal(subtotal);
  const sorted    = sortSeats(selectedSeats);

  // ─── VALIDATE FORM ────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim())          { toast.error('Name is required');               return false; }
    if (!isValidEmail(email))  { toast.error('Enter a valid email');            return false; }
    if (!isValidPhone(phone))  { toast.error('Enter a valid phone number');     return false; }
    return true;
  };

  // ─── HANDLE PAYMENT ───────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);

    try {
      // 1. Create booking (status: pending)
      const bookingRes = await bookingAPI.create({
        showtimeId: selectedShowtime.showtime_id,
        seatCodes:  selectedSeats,
        orderId:    `temp_${Date.now()}`,
      });
      const booking = bookingRes.data.booking;
      setBooking(booking);

      // 2. Create Razorpay order
      const orderRes = await paymentAPI.createOrder({
        amount:    grandTotal,
        bookingId: booking.id,
      });
      const order = orderRes.data;
      setOrder(order);

      // 3. Open Razorpay checkout
      openRazorpay({
        orderId:   order.order_id,
        amount:    order.amount,
        keyId:     order.key_id,
        bookingId: booking.id,
        user:      { name, email, phone },

        // ─── PAYMENT SUCCESS ──────────────────────────────────────────
        onSuccess: async (response) => {
          try {
            // Verify payment signature
            await paymentAPI.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId:           booking.id,
            });

            toast.success('Payment successful! 🎉');
            clearBooking();
            navigate(`/confirmation/${booking.id}`);

          } catch {
            toast.error('Payment verification failed. Contact support.');
            setProcessing(false);
          }
        },

        // ─── PAYMENT FAILURE ──────────────────────────────────────────
        onFailure: async (reason) => {
          try {
            await paymentAPI.paymentFailed({
              bookingId:  booking.id,
              seatCodes:  selectedSeats,
              showtimeId: selectedShowtime.showtime_id,
            });
          } catch {}
          toast.error(reason || 'Payment failed. Please try again.');
          setProcessing(false);
        },
      });

    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
      setProcessing(false);
    }
  };

  if (processing) return <PaymentLoader />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', paddingTop: 72 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '38px 44px 88px' }}>

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none',
          color: 'var(--muted)', cursor: 'pointer',
          fontSize: 13, fontFamily: 'Outfit, sans-serif', marginBottom: 14,
        }}>← Back to Seat Selection</button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 50, color: '#ede9e0', marginBottom: 36,
          }}
        >Checkout</motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>

          {/* ─── LEFT ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                background: 'var(--surface)', borderRadius: 16,
                border: '1px solid var(--border)', padding: 28,
              }}
            >
              <h3 style={{ color: '#ede9e0', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                Contact Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['Full Name',     'text',     name,  setName,  'John Doe'],
                  ['Email Address', 'email',    email, setEmail, 'you@example.com'],
                  ['Phone Number',  'tel',      phone, setPhone, '+91 98765 43210'],
                ].map(([label, type, val, setter, ph]) => (
                  <div key={label}>
                    <label className="label">{label}</label>
                    <input
                      className="field" type={type}
                      placeholder={ph} value={val}
                      onChange={(e) => setter(e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'var(--surface)', borderRadius: 16,
                border: '1px solid var(--border)', padding: 28,
              }}
            >
              <h3 style={{ color: '#ede9e0', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                Payment Method
              </h3>

              {/* Razorpay card */}
              <div style={{
                background: 'linear-gradient(135deg,#052030,#0a3a55)',
                borderRadius: 12, padding: 20,
                border: '1px solid #1a6090', marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      color: '#00c8f0', fontWeight: 800,
                      fontSize: 17, letterSpacing: 2.5,
                    }}>RAZORPAY</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                      UPI · Cards · Net Banking · Wallets
                    </div>
                  </div>
                  <div style={{ fontSize: 32 }}>💳</div>
                </div>
              </div>

              {/* Payment options */}
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 16 }}>
                {['💳 Card', '📱 UPI', '🏦 Netbanking', '👛 Wallets'].map((m) => (
                  <div key={m} style={{
                    background: 'var(--surface-up)',
                    border: '1px solid var(--border)',
                    borderRadius: 7, padding: '7px 12px',
                    fontSize: 12, color: 'var(--muted)',
                  }}>{m}</div>
                ))}
              </div>

              <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>
                🔒 Your data is protected with 256-bit SSL encryption. We never store card details.
              </p>
            </motion.div>
          </div>

          {/* ─── RIGHT — ORDER SUMMARY ───────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                background: 'var(--surface)', borderRadius: 16,
                border: '1px solid var(--border)', padding: 24,
              }}
            >
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24, color: '#ede9e0', marginBottom: 20,
              }}>Order Summary</h3>

              {/* Movie info */}
              <div style={{
                background: 'var(--surface-up)', borderRadius: 10,
                padding: 16, marginBottom: 18,
              }}>
                <div style={{ fontWeight: 600, color: '#ede9e0', fontSize: 14, marginBottom: 3 }}>
                  {selectedMovie.title}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 2 }}>
                  {formatDate(selectedDate)} · {formatTime(selectedShowtime.show_time)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10 }}>
                  {selectedShowtime.venue_name?.split(',')[0]}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {sorted.map((s) => (
                    <span key={s} style={{
                      background: 'rgba(240,192,64,0.09)',
                      border: '1px solid rgba(240,192,64,0.22)',
                      color: 'var(--gold)', fontSize: 10,
                      padding: '2px 6px', borderRadius: 3,
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 14, marginBottom: 20,
              }}>
                {[
                  [`${selectedSeats.length} × Ticket${selectedSeats.length > 1 ? 's' : ''}`, formatCurrency(subtotal)],
                  ['Convenience Fee (4%)', formatCurrency(fee)],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 8, fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span style={{ color: '#ede9e0' }}>{val}</span>
                  </div>
                ))}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12, marginTop: 4,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#ede9e0', fontWeight: 700, fontSize: 15 }}>Total</span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 30, fontWeight: 700, color: 'var(--gold)',
                  }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                className="btn-gold"
                style={{ width: '100%', padding: 16, fontSize: 15 }}
                onClick={handlePay}
              >
                Pay {formatCurrency(grandTotal)} →
              </button>

              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 7, justifyContent: 'center', marginTop: 14,
              }}>
                <span>🔒</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>Secured by Razorpay</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}