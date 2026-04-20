import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
import Navbar from './components/Navbar';

// ─── PAGES ────────────────────────────────────────────────────────────────────
import HomePage            from './pages/HomePage';
import MoviesPage          from './pages/MoviesPage';
import MovieDetailPage     from './pages/MovieDetailPage';
import SeatSelectionPage   from './pages/SeatSelectionPage';
import PaymentPage         from './pages/PaymentPage';
import ConfirmationPage    from './pages/ConfirmationPage';
import MyBookingsPage      from './pages/MyBookingsPage';

// ─── AUTH PAGES (inline — small enough) ──────────────────────────────────────
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from './services/api';
import { useBooking } from './context/BookingContext';
import { isValidEmail } from './utils/helpers';
import toast from 'react-hot-toast';
import { Spinner } from './components/Loader';
import { GoogleLogin } from '@react-oauth/google';

// ─── AUTH PAGE (OTP & Google Login) ──────────────────────────────────────────
function AuthPage() {
  const [step,     setStep]    = useState('email'); // 'email' | 'otp'
  const [email,    setEmail]   = useState('');
  const [otp,      setOtp]     = useState('');
  const [loading,  setLoading] = useState(false);
  const { login }  = useBooking();
  const navigate   = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return toast.error('Email is required');
    if (!isValidEmail(email)) return toast.error('Enter a valid email');
    
    setLoading(true);
    try {
      await authAPI.sendOtp({ email });
      toast.success('OTP sent to your email! 📩');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return toast.error('Enter a valid 6-digit OTP');
    
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ email, otp });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to Cinéplex, ${res.data.user.name.split(' ')[0]}! 🎬`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authAPI.googleLogin({ credential: credentialResponse.credential });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to Cinéplex, ${res.data.user.name.split(' ')[0]}! 🎬`);
      navigate('/');
    } catch (err) {
      toast.error('Google Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'var(--surface)', borderRadius: 20,
          border: '1px solid var(--border)', padding: '44px 40px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{step === 'email' ? '🍿' : '🔐'}</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, color: '#ede9e0', marginBottom: 6,
          }}>{step === 'email' ? 'Welcome' : 'Enter OTP'}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {step === 'email' ? 'Sign in or create an account' : `We sent a code to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_black"
                shape="pill"
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input className="field" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>

            <button className="btn-gold"
              style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 12 }}
              onClick={handleSendOtp} disabled={loading}
            >
              {loading ? <Spinner size={18} color="#06060c" /> : 'Continue with Email →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">6-Digit Code</label>
              <input className="field" type="text" placeholder="123456" maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
              />
            </div>

            <button className="btn-gold"
              style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 12 }}
              onClick={handleVerifyOtp} disabled={loading}
            >
              {loading ? <Spinner size={18} color="#06060c" /> : 'Verify & Login ✓'}
            </button>

            <button 
              onClick={() => setStep('email')} 
              style={{ background: 'none', border: 'none', color: 'var(--muted)', marginTop: 10, cursor: 'pointer', fontSize: 13 }}
            >
              ← Back to Email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── 404 PAGE ─────────────────────────────────────────────────────────────────
function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 18, textAlign: 'center',
      padding: '0 20px',
    }}>
      <div style={{ fontSize: 72 }}>🎬</div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 64, color: '#ede9e0',
      }}>404</h1>
      <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 340 }}>
        Looks like this page took a different show. Let's get you back on screen.
      </p>
      <button className="btn-gold"
        style={{ padding: '13px 32px', fontSize: 15, marginTop: 8 }}
        onClick={() => navigate('/')}
      >Back to Home</button>
    </div>
  );
}

// ─── PROTECTED ROUTE ──────────────────────────────────────────────────────────
function Protected({ children }) {
  const { isAuthed } = useBooking();
  const navigate     = useNavigate();
  const location     = useLocation();

  useEffect(() => {
    if (!isAuthed) {
      toast.error('Please sign in to continue');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthed]);

  return isAuthed ? children : null;
}

// ─── SCROLL TO TOP ON ROUTE CHANGE ───────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/movies"   element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Protected */}
          <Route path="/movies/:id/seats" element={
            <Protected><SeatSelectionPage /></Protected>
          }/>
          <Route path="/payment" element={
            <Protected><PaymentPage /></Protected>
          }/>
          <Route path="/confirmation/:id" element={
            <Protected><ConfirmationPage /></Protected>
          }/>
          <Route path="/bookings" element={
            <Protected><MyBookingsPage /></Protected>
          }/>
          <Route path="/bookings/:id" element={
            <Protected><MyBookingsPage /></Protected>
          }/>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </AnimatePresence>
    </div>
  );
}