import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const { isAuthed, user, logout }    = useBooking();
  const location  = useLocation();
  const navigate  = useNavigate();

  // ─── SCROLL DETECTION ───────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── CLOSE MENU ON ROUTE CHANGE ─────────────────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         1000,
        height:         64,
        background:     scrolled ? 'rgba(7,7,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(22px)'         : 'none',
        borderBottom:   scrolled ? '1px solid rgba(240,192,64,0.08)' : 'none',
        transition:     'all 0.3s ease',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 44px',
      }}
    >
      {/* ─── LOGO ─────────────────────────────────────────────────────── */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34,
          background:   'linear-gradient(135deg,#f0c040,#d0901a)',
          borderRadius: 8,
          display:      'flex', alignItems: 'center', justifyContent: 'center',
          fontSize:     17, flexShrink: 0,
        }}>🎬</div>
        <span style={{
          fontFamily:    "'Cormorant Garamond', serif",
          fontSize:      22, fontWeight: 700,
          color:         '#ede9e0', letterSpacing: 1.4,
        }}>CINÉPLEX</span>
      </Link>

      {/* ─── DESKTOP LINKS ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}>
        {[['/', 'Home'], ['/movies', 'Movies']].map(([path, label]) => (
          <Link key={path} to={path}
            className={`nav-link ${isActive(path) ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >{label}</Link>
        ))}

        {isAuthed && (
          <Link to="/bookings"
            className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >My Bookings</Link>
        )}
      </div>

      {/* ─── AUTH AREA ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {isAuthed ? (
          <div style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setDropOpen(!dropOpen)}
              style={{
                display:        'flex', alignItems: 'center', gap: 9,
                background:     'rgba(255,255,255,0.06)',
                border:         '1.5px solid rgba(255,255,255,0.1)',
                borderRadius:   9, padding:    '7px 14px',
                cursor:         'pointer', color: '#ede9e0',
                fontFamily:     'Outfit, sans-serif', fontSize: 13,
                transition:     'all 0.2s',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg,#f0c040,#d0901a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#06060c',
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              <span style={{ color: 'var(--muted)', fontSize: 10 }}>▼</span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{    opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position:     'absolute', top: 'calc(100% + 10px)', right: 0,
                    background:   '#0f0f1e',
                    border:       '1px solid rgba(240,192,64,0.12)',
                    borderRadius: 12, padding: '8px 0',
                    minWidth:     180,
                    boxShadow:    '0 20px 60px rgba(0,0,0,0.6)',
                    zIndex:       999,
                  }}
                >
                  <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#ede9e0', fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                  </div>
                  {[
                    ['/bookings', '🎟️', 'My Bookings'],
                    ['/profile',  '👤', 'Profile'],
                  ].map(([path, icon, label]) => (
                    <Link key={path} to={path}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display:        'flex', alignItems: 'center', gap: 10,
                        padding:        '10px 16px', textDecoration: 'none',
                        color:          'var(--muted)', fontSize: 13,
                        transition:     'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ede9e0'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                    >
                      <span>{icon}</span><span>{label}</span>
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout}
                      style={{
                        width:      '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding:    '10px 16px', background: 'none', border: 'none',
                        color:      '#e0303a', fontSize: 13, cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif', textAlign: 'left',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <span>🚪</span><span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login">
              <button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 13 }}>
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="btn-gold" style={{ padding: '9px 20px', fontSize: 13 }}>
                Sign Up
              </button>
            </Link>
          </div>
        )}

        {/* Book Now CTA */}
        <Link to="/movies">
          <button className="btn-gold" style={{ padding: '9px 22px', fontSize: 13 }}>
            Book Now
          </button>
        </Link>
      </div>
    </motion.nav>
  );
}