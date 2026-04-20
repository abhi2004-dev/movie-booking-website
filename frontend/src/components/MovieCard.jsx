import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMovieMeta, formatTime } from '../utils/helpers';

export default function MovieCard({ movie, delay = 0, size = 'normal' }) {
  const navigate = useNavigate();
  const meta     = getMovieMeta(movie.id);

  const isLarge  = size === 'large';
  const width    = isLarge ? 220 : 190;
  const height   = isLarge ? 310 : 268;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.025 }}
      onClick={() => navigate(`/movies/${movie.id}`)}
      style={{
        background:   'var(--surface)',
        borderRadius: 14,
        overflow:     'hidden',
        border:       '1px solid var(--border)',
        width,
        flexShrink:   0,
        cursor:       'pointer',
        boxShadow:    '0 4px 20px rgba(0,0,0,0.4)',
        transition:   'box-shadow 0.32s ease',
      }}
    >
      {/* ─── POSTER ───────────────────────────────────────────────────── */}
      <div style={{ height, background: 'var(--surface-up)', position: 'relative', overflow: 'hidden' }}>

        {movie.poster_url ? (
          <motion.img
            src={movie.poster_url}
            alt={movie.title}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: meta.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {meta.icon}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position:   'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,7,15,0.95) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}/>

        {/* Title */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding:  '10px 14px', pointerEvents: 'none'
        }}>
          <div style={{
            fontFamily:  "'Cormorant Garamond', serif",
            fontSize:    isLarge ? 20 : 18,
            fontWeight:  700,
            color:       '#ede9e0',
            lineHeight:  1.22,
          }}>{movie.title}</div>
        </div>
      </div>

      {/* ─── INFO ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   8,
        }}>
          {/* Rating */}
          <span style={{
            background:   'linear-gradient(135deg,#f0c040,#d0901a)',
            color:        '#06060c',
            fontSize:     11, fontWeight: 800,
            padding:      '3px 8px', borderRadius: 4,
          }}>⭐ {movie.rating}</span>

          {/* Duration */}
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>
            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </span>
        </div>

        {/* Genres */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {movie.genre?.slice(0, 2).map((g) => (
            <span key={g} style={{
              background:   'var(--surface-up)',
              color:        'var(--muted)',
              fontSize:     10,
              padding:      '2px 7px', borderRadius: 4,
            }}>{g}</span>
          ))}
        </div>

        {/* Language */}
        <div style={{
          display:     'flex',
          alignItems:  'center',
          gap:         5,
          marginTop:   4,
        }}>
          <span style={{ fontSize: 10 }}>🌐</span>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{movie.language}</span>
        </div>
      </div>
    </motion.div>
  );
}