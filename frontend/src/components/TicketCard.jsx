import { motion } from 'framer-motion';
import { getMovieMeta, formatDate, formatTime, formatCurrency, calcFee } from '../utils/helpers';

export default function TicketCard({ booking, animate = true }) {
  const meta      = getMovieMeta(booking.movie_id || booking.movie?.id);
  const grandTotal= Number(booking.grand_total) || Number(booking.amount) + calcFee(Number(booking.amount));

  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate ? {
    initial:    { opacity: 0, rotateX: 18, y: -30 },
    animate:    { opacity: 1, rotateX: 0,  y: 0   },
    transition: { duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
    style:      { perspective: 600 },
  } : {};

  return (
    <Wrapper {...wrapperProps}>
      <div style={{
        background:   'var(--surface)',
        borderRadius: 22,
        border:       '1px solid var(--border)',
        overflow:     'hidden',
        boxShadow:    '0 40px 100px rgba(0,0,0,0.85), 0 0 60px rgba(240,192,64,0.04)',
      }}>

        {/* ─── TOP BAND ───────────────────────────────────────────────── */}
        <div style={{
          background: meta.grad,
          padding:    '24px 26px 20px',
          position:   'relative',
        }}>
          {/* BG icon */}
          <div style={{
            position:       'absolute', inset: 0,
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            fontSize:       70, opacity: 0.12,
          }}>{meta.icon}</div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily:  "'Cormorant Garamond', serif",
                fontSize:    28, fontWeight: 700,
                color:       '#ede9e0', lineHeight: 1.2,
              }}>
                {booking.movie_title || booking.movie?.title}
              </div>
              <div style={{ color: 'rgba(237,233,224,0.6)', fontSize: 12, marginTop: 4 }}>
                {booking.movie_language || booking.movie?.language}
                {booking.movie_duration || booking.movie?.duration
                  ? ` · ${Math.floor((booking.movie_duration || booking.movie?.duration) / 60)}h ${(booking.movie_duration || booking.movie?.duration) % 60}m`
                  : ''}
              </div>
            </div>
            <span style={{
              background:   'linear-gradient(135deg,#f0c040,#d0901a)',
              color:        '#06060c', fontWeight: 800,
              fontSize:     11, padding: '3px 9px', borderRadius: 4,
            }}>⭐ {booking.movie?.rating || '—'}</span>
          </div>
        </div>

        {/* ─── TORN EDGE ──────────────────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <div style={{ borderTop: '2px dashed rgba(240,192,64,0.16)' }}/>
          <div style={{
            position: 'absolute', top: -10, left: -1,
            width: 20, height: 20,
            background: meta.grad, borderRadius: '50%',
          }}/>
          <div style={{
            position: 'absolute', top: -10, right: -1,
            width: 20, height: 20,
            background: meta.grad, borderRadius: '50%',
          }}/>
        </div>

        {/* ─── BODY ───────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 26px 24px' }}>

          {/* Info grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 '12px 18px',
            marginBottom:        18,
          }}>
            {[
              ['Booking ID',  booking.id?.slice(0, 8).toUpperCase()],
              ['Date',        formatDate(booking.show_date || booking.bookedOn)],
              ['Showtime',    formatTime(booking.show_time || booking.time)],
              ['Seats',       (booking.seats || []).join(', ')],
              ['Venue',       (booking.venue_name || booking.venue || '').split(',')[0]],
              ['Name',        booking.user_name || booking.name || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{
                  color:         'var(--muted)', fontSize: 9,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  marginBottom:  3,
                }}>{label}</div>
                <div style={{
                  color:      '#ede9e0', fontWeight: 500, fontSize: 12,
                  wordBreak:  'break-word',
                }}>{value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Status badge */}
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display:      'inline-flex', alignItems: 'center', gap: 6,
              background:   booking.status === 'confirmed'
                              ? 'rgba(40,160,96,0.12)'
                              : 'rgba(224,48,58,0.1)',
              border:       `1px solid ${booking.status === 'confirmed' ? 'rgba(40,160,96,0.35)' : 'rgba(224,48,58,0.35)'}`,
              color:        booking.status === 'confirmed' ? '#28a060' : '#e0303a',
              fontSize:     11, fontWeight: 600,
              padding:      '4px 12px', borderRadius: 5,
            }}>
              {booking.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
            </span>
          </div>

          {/* QR code placeholder */}
          <div style={{ textAlign: 'center', margin: '4px 0 16px' }}>
            <div style={{
              display:        'inline-flex', flexDirection: 'column',
              alignItems:     'center', gap: 6,
            }}>
              <div style={{
                width: 70, height: 70,
                background:   '#ede9e0', borderRadius: 8,
                display:      'flex', alignItems: 'center', justifyContent: 'center',
                fontSize:     34,
              }}>⬛</div>
              <span style={{
                color:         'var(--muted)', fontSize: 9,
                letterSpacing: 2.5, textTransform: 'uppercase',
              }}>Scan at Entrance</span>
            </div>
          </div>

          {/* Amount */}
          <div style={{
            background:   'rgba(240,192,64,0.07)',
            border:       '1px solid rgba(240,192,64,0.16)',
            borderRadius: 10, padding: '12px 16px',
            display:      'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Amount Paid</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize:   26, fontWeight: 700, color: 'var(--gold)',
            }}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}