// ─── DATE & TIME ──────────────────────────────────────────────────────────────

// Format date to readable string — "15 Jan 2024"
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
};

// Format time — "08:00:00" → "8:00 AM"
export const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const h   = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

// Get today's date as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// Get tomorrow's date as YYYY-MM-DD
export const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Get date N days from now
export const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// Get day label — "Today", "Tomorrow", or "Mon, 15 Jan"
export const getDayLabel = (dateStr) => {
  const t = today();
  const tm = tomorrow();
  if (dateStr === t)  return 'Today';
  if (dateStr === tm) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
};

// ─── CURRENCY ─────────────────────────────────────────────────────────────────

// Format to Indian Rupees — 1000 → "₹1,000"
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate convenience fee (4%)
export const calcFee = (amount) => Math.round(amount * 0.04);

// Calculate grand total
export const calcGrandTotal = (amount) => amount + calcFee(amount);

// ─── SEATS ────────────────────────────────────────────────────────────────────

// Get seat category from row label
export const getSeatCategory = (rowLabel) => {
  if (['A', 'B'].includes(rowLabel))                     return 'premium';
  if (['C', 'D', 'E', 'F', 'G'].includes(rowLabel))     return 'gold';
  return 'silver';
};

// Get seat price based on category and pricing object
export const getSeatPrice = (seatCode, pricing) => {
  const row = seatCode[0];
  const cat = getSeatCategory(row);
  return pricing[cat] || pricing[`price_${cat}`] || 0;
};

// Calculate total for selected seats
export const calcSeatsTotal = (selectedSeats, pricing) => {
  return selectedSeats.reduce((total, seat) => {
    return total + Number(getSeatPrice(seat, pricing));
  }, 0);
};

// Sort seat codes — A1, A2, B3 ...
export const sortSeats = (seats) => {
  return [...seats].sort((a, b) => {
    const rowA = a[0], rowB = b[0];
    const numA = parseInt(a.slice(1)), numB = parseInt(b.slice(1));
    if (rowA !== rowB) return rowA.localeCompare(rowB);
    return numA - numB;
  });
};

// ─── STRING HELPERS ───────────────────────────────────────────────────────────

// Truncate long text
export const truncate = (str, maxLen = 80) => {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate random booking ID
export const generateBookingId = () => {
  return 'CX' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
};

export const isValidPassword = (password) => {
  return password.length >= 6;
};

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────

export const storage = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
  clear: () => {
    try { localStorage.clear(); } catch {}
  },
};

// ─── MOVIE HELPERS ────────────────────────────────────────────────────────────

// Map movie id to gradient + icon (matches seed data)
export const MOVIE_META = {
  'a1b2c3d4-0001-0001-0001-000000000001': { grad: 'linear-gradient(135deg,#0d1a05,#1e4a0a,#2f7a10)', icon: '🌿', tag: 'Record Breaking' },
  'a1b2c3d4-0001-0001-0001-000000000002': { grad: 'linear-gradient(135deg,#1a0a30,#4a1a6e,#8b2fc9)', icon: '🔮', tag: 'Epic'             },
  'a1b2c3d4-0001-0001-0001-000000000003': { grad: 'linear-gradient(135deg,#050a16,#0e2648,#1a4080)', icon: '👻', tag: 'Must Watch'       },
  'a1b2c3d4-0001-0001-0001-000000000004': { grad: 'linear-gradient(135deg,#0a1a1a,#103535,#186060)', icon: '🎯', tag: 'Cult Hit'         },
  'a1b2c3d4-0001-0001-0001-000000000005': { grad: 'linear-gradient(135deg,#1a1505,#4a3a10,#8a6a20)', icon: '💰', tag: 'Award Winner'     },
  'a1b2c3d4-0001-0001-0001-000000000006': { grad: 'linear-gradient(135deg,#1a0505,#4a1010,#8b2020)', icon: '⚔️',  tag: 'Trending'         },
  'a1b2c3d4-0001-0001-0001-000000000007': { grad: 'linear-gradient(135deg,#1a0a05,#3a1a10,#6a3a20)', icon: '🦁', tag: 'New Release'      },
  'a1b2c3d4-0001-0001-0001-000000000008': { grad: 'linear-gradient(135deg,#0a0a1a,#1a2040,#304888)', icon: '📰', tag: 'Acclaimed'        },
};

export const getMovieMeta = (movieId) => {
  return MOVIE_META[movieId] || {
    grad: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    icon: '🎬',
    tag:  'Now Showing',
  };
};