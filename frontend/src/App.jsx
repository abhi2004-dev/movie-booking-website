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
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from './services/api';
import { useBooking } from './context/BookingContext';
import { isValidEmail, isValidPhone, isValidPassword } from './utils/helpers';
import toast from 'react-hot-toast';
import { Spinner } from './components/Loader';

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }   = useBooking();
  const navigate    = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('All fields are required');
    if (!isValidEmail(email)) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 🎬`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
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
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, color: '#ede9e0', marginBottom: 6,
          }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to your Cinéplex account</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Email', 'email', email, setEmail, 'you@example.com'],
            ['Password', 'password', password, setPassword, '••••••••'],
          ].map(([label, type, val, setter, ph]) => (
            <div key={label}>
              <label className="label">{label}</label>
              <input className="field" type={type} placeholder={ph}
                value={val} onChange={(e) => setter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          ))}
        </div>

        <button className="btn-gold"
          style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 24 }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? <Spinner size={18} color="#06060c" /> : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
function RegisterPage() {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }  = useBooking();
  const navigate   = useNavigate();

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password)
      return toast.error('All fields are required');
    if (!isValidEmail(form.email))    return toast.error('Enter a valid email');
    if (!isValidPhone(form.phone))    return toast.error('Enter a valid Indian phone number');
    if (!isValidPassword(form.password)) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success(`Account created! Welcome, ${res.data.user.name.split(' ')[0]}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
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
          width: '100%', maxWidth: 440,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, color: '#ede9e0', marginBottom: 6,
          }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Join Cinéplex today</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Full Name',     'text',     'name',     'John Doe'],
            ['Email Address', 'email',    'email',    'you@example.com'],
            ['Phone Number',  'tel',      'phone',    '+91 98765 43210'],
            ['Password',      'password', 'password', 'Min. 6 characters'],
          ].map(([label, type, key, ph]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="field" type={type} placeholder={ph}
                value={form[key]} onChange={(e) => update(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button className="btn-gold"
          style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 24 }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? <Spinner size={18} color="#06060c" /> : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign In</Link>
        </p>
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
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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