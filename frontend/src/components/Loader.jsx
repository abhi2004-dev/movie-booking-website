import { motion } from 'framer-motion';

// ─── FULL PAGE LOADER ─────────────────────────────────────────────────────────
export function PageLoader({ message = 'Loading…' }) {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexDirection:  'column',
      gap:            20,
      background:     'var(--bg)',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
        style={{
          width:        52,
          height:       52,
          border:       '3px solid rgba(240,192,64,0.15)',
          borderTop:    '3px solid var(--gold)',
          borderRadius: '50%',
        }}
      />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize:   20, color: '#ede9e0',
      }}>{message}</p>
    </div>
  );
}

// ─── INLINE SPINNER ───────────────────────────────────────────────────────────
export function Spinner({ size = 28, color = 'var(--gold)' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      style={{
        width:        size,
        height:       size,
        border:       `3px solid rgba(240,192,64,0.15)`,
        borderTop:    `3px solid ${color}`,
        borderRadius: '50%',
        flexShrink:   0,
      }}
    />
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
export function SkeletonCard({ width = 190, height = 320 }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 14,
      overflow:     'hidden',
      flexShrink:   0,
      border:       '1px solid var(--border)',
    }}>
      <div className="shimmer" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
export function SkeletonRow({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 22, overflow: 'hidden' }}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── SKELETON TEXT ────────────────────────────────────────────────────────────
export function SkeletonText({ width = '100%', height = 16, borderRadius = 4 }) {
  return (
    <div
      className="shimmer"
      style={{ width, height, borderRadius }}
    />
  );
}

// ─── SKELETON BLOCK ───────────────────────────────────────────────────────────
export function SkeletonBlock({ lines = 3, gap = 10 }) {
  const widths = ['100%', '80%', '60%', '90%', '70%'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {[...Array(lines)].map((_, i) => (
        <SkeletonText key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

// ─── BUTTON LOADER ────────────────────────────────────────────────────────────
export function ButtonLoader({ text = 'Processing…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Spinner size={18} />
      <span>{text}</span>
    </div>
  );
}

// ─── PAYMENT PROCESSING LOADER ────────────────────────────────────────────────
export function PaymentLoader() {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexDirection:  'column',
      gap:            22,
      background:     'var(--bg)',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
        style={{
          width:        58,
          height:       58,
          border:       '3px solid rgba(240,192,64,0.15)',
          borderTop:    '3px solid var(--gold)',
          borderRadius: '50%',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily:  "'Cormorant Garamond', serif",
          fontSize:    26, color: '#ede9e0', marginBottom: 8,
        }}>Processing Payment…</p>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          🔒 Secured by Razorpay — do not close this window
        </p>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width:        8, height: 8,
              borderRadius: '50%',
              background:   'var(--gold)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT ───────────────────────────────────────────────────────────
export default PageLoader;