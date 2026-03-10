/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // ─── COLORS ──────────────────────────────────────────────────────────
      colors: {
        bg:          '#07070f',
        surface:     '#0f0f1e',
        'surface-up':'#181830',
        gold:        '#f0c040',
        'gold-dim':  '#b8922e',
        'gold-glow': 'rgba(240,192,64,0.18)',
        crimson:     '#e0303a',
        muted:       '#888898',
        soft:        '#ede9e0',
      },

      // ─── FONTS ───────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['Outfit', 'sans-serif'],
      },

      // ─── FONT SIZES ──────────────────────────────────────────────────────
      fontSize: {
        'hero': 'clamp(44px, 7vw, 94px)',
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────────
      borderRadius: {
        'xl2': '18px',
        'xl3': '22px',
      },

      // ─── BOX SHADOWS ─────────────────────────────────────────────────────
      boxShadow: {
        'gold':    '0 10px 36px rgba(240,192,64,0.45)',
        'gold-sm': '0 4px 16px rgba(240,192,64,0.25)',
        'card':    '0 24px 70px rgba(0,0,0,0.7)',
        'ticket':  '0 40px 100px rgba(0,0,0,0.85)',
        'deep':    '0 50px 120px rgba(0,0,0,0.85)',
      },

      // ─── ANIMATIONS ──────────────────────────────────────────────────────
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(240,192,64,0.5)' },
          '50%':      { boxShadow: '0 0 0 14px rgba(240,192,64,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        confettiPop: {
          '0%':   { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.15) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        ticketDrop: {
          from: { opacity: '0', transform: 'perspective(600px) rotateX(18deg) translateY(-30px)' },
          to:   { opacity: '1', transform: 'perspective(600px) rotateX(0deg) translateY(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-up':      'fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'float':        'floatY 4s ease-in-out infinite',
        'float-slow':   'floatY 6s ease-in-out infinite',
        'pulse-gold':   'pulseGold 1.8s infinite',
        'shimmer':      'shimmer 1.6s infinite linear',
        'confetti':     'confettiPop 0.6s cubic-bezier(.22,1,.36,1)',
        'ticket-drop':  'ticketDrop 0.7s 0.25s cubic-bezier(.22,1,.36,1) both',
        'spin-slow':    'spin 0.75s linear infinite',
      },

      // ─── BACKGROUND GRADIENTS ─────────────────────────────────────────────
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #f0c040 0%, #d4a020 100%)',
        'dark-gradient':   'linear-gradient(135deg, #0f0f1e, #161630)',
        'hero-overlay':    'radial-gradient(ellipse 70% 80% at 25% 60%, transparent 0%, #07070f 70%)',
        'card-overlay':    'linear-gradient(to top, #0f0f1e 0%, transparent 55%)',
      },
    },
  },

  plugins: [],
};