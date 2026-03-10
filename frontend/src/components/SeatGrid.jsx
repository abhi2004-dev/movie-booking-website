import { motion } from 'framer-motion';
import { getSeatCategory } from '../utils/helpers';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const SEATS_PER_ROW = 12;

const CATEGORY_STYLES = {
  premium: { bg: '#0d2a1a', border: '#28a060', color: '#28a060' },
  gold:    { bg: '#28200a', border: '#f0c040', color: '#f0c040' },
  silver:  { bg: '#161628', border: '#7070a0', color: '#7070a0' },
};

export default function SeatGrid({
  bookedSeats  = [],
  lockedSeats  = [],
  selectedSeats = [],
  onSeatClick,
  pricing      = {},
  disabled     = false,
}) {
  const bookedSet  = new Set(bookedSeats);
  const lockedSet  = new Set(lockedSeats);
  const selectedSet= new Set(selectedSeats);

  const getSeatState = (seatCode) => {
    if (bookedSet.has(seatCode))   return 'booked';
    if (lockedSet.has(seatCode))   return 'locked';
    if (selectedSet.has(seatCode)) return 'selected';
    return 'available';
  };

  const handleClick = (seatCode) => {
    if (disabled) return;
    const state = getSeatState(seatCode);
    if (state === 'booked' || state === 'locked') return;
    if (onSeatClick) onSeatClick(seatCode);
  };

  return (
    <div>
      {/* ─── SCREEN ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          height:     3,
          background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
          borderRadius: 2, marginBottom: 8,
        }}/>
        <span style={{
          color:         'var(--muted)', fontSize: 10,
          letterSpacing: 3, textTransform: 'uppercase',
        }}>All Eyes This Way — Screen</span>
      </div>

      {/* ─── LEGEND ───────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex', gap: 14,
        justifyContent: 'center',
        marginBottom:   28, flexWrap: 'wrap',
      }}>
        {[
          ['av-premium', '#28a060', `Premium ₹${pricing.premium || pricing.price_premium || ''}`],
          ['av-gold',    'var(--gold)', `Gold ₹${pricing.gold || pricing.price_gold || ''}`],
          ['av-silver',  '#7070a0', `Silver ₹${pricing.silver || pricing.price_silver || ''}`],
          ['booked',     '#2a2a2a', 'Booked'],
          ['locked',     '#602020', 'Reserved'],
          ['selected',   'var(--gold)', 'Selected'],
        ].map(([cls, col, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              className={`seat ${cls}`}
              style={{ width: 18, height: 15, fontSize: 0, animation: 'none', flexShrink: 0 }}
            />
            <span style={{ color: col, fontSize: 10 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ─── SEAT GRID ────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex', flexDirection: 'column',
        gap:            6, alignItems: 'center',
      }}>
        {ROWS.map((row) => {
          const cat = getSeatCategory(row);
          return (
            <div key={row} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>

              {/* Row label left */}
              <span style={{
                color:     'var(--muted)', fontSize: 11,
                width:     16, textAlign: 'right',
                fontWeight:600, flexShrink: 0,
              }}>{row}</span>

              {/* Seats */}
              <div style={{ display: 'flex', gap: 4, marginLeft: 3 }}>
                {[...Array(SEATS_PER_ROW)].map((_, i) => {
                  const seatCode = `${row}${i + 1}`;
                  const state    = getSeatState(seatCode);
                  const isAvail  = state === 'available';
                  const styles   = CATEGORY_STYLES[cat];

                  return (
                    <motion.div
                      key={seatCode}
                      whileHover={isAvail && !disabled ? { scale: 1.22, zIndex: 2 } : {}}
                      whileTap={isAvail && !disabled   ? { scale: 0.95 }            : {}}
                      onClick={() => handleClick(seatCode)}
                      title={`${seatCode} — ${cat} ${
                        state === 'booked'   ? '(Booked)'   :
                        state === 'locked'   ? '(Reserved)' :
                        state === 'selected' ? '(Selected)' : ''
                      }`}
                      style={{
                        width:          30, height: 26,
                        borderRadius:   '5px 5px 3px 3px',
                        cursor:         state === 'booked' || state === 'locked' || disabled
                                          ? 'not-allowed' : 'pointer',
                        fontSize:       8.5, fontWeight: 700,
                        display:        'flex', alignItems: 'center', justifyContent: 'center',
                        userSelect:     'none', position: 'relative',
                        transition:     'box-shadow 0.18s ease',

                        // Dynamic styles per state
                        background:
                          state === 'selected' ? 'var(--gold)'  :
                          state === 'booked'   ? '#111'         :
                          state === 'locked'   ? '#2a1010'      :
                          styles.bg,

                        border: `1.5px solid ${
                          state === 'selected' ? 'var(--gold)'  :
                          state === 'booked'   ? '#2a2a2a'      :
                          state === 'locked'   ? '#602020'      :
                          styles.border
                        }`,

                        color:
                          state === 'selected' ? '#06060c'  :
                          state === 'booked'   ? '#2a2a2a'  :
                          state === 'locked'   ? '#602020'  :
                          styles.color,

                        animation: state === 'selected' ? 'pulseGold 1.8s infinite' : 'none',
                      }}
                    >
                      {state === 'selected' ? '✓' : ''}
                    </motion.div>
                  );
                })}
              </div>

              {/* Row label right */}
              <span style={{
                color:      'var(--muted)', fontSize: 11,
                width:      16, marginLeft: 3,
                fontWeight: 600, flexShrink: 0,
              }}>{row}</span>
            </div>
          );
        })}
      </div>

      {/* ─── CATEGORY LABELS ──────────────────────────────────────────── */}
      <div style={{
        display:       'flex', flexDirection: 'column',
        gap:           4, marginTop: 18, marginLeft: 26,
      }}>
        {[
          ['A – B', 'Premium'],
          ['C – G', 'Gold'],
          ['H – K', 'Silver'],
        ].map(([rows, label]) => (
          <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 600, width: 32 }}>{rows}</span>
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}