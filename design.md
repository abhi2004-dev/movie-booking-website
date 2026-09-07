# Design — Movie Booking Platform

## 1. Database Schema (PostgreSQL)

### Entities & Relationships (ER description)

- **users** — id, email (unique), password_hash, name, created_at
- **movies** — id, tmdb_id (unique), title, genre, language, rating,
  poster_url, synopsis, duration_minutes, cached_at
- **theatres** — id, name, city, address
- **screens** — id, theatre_id (FK → theatres), name, total_seats
- **seats** — id, screen_id (FK → screens), row_label, seat_number,
  seat_type (normal/premium/recliner etc.)
- **shows** — id, movie_id (FK → movies), screen_id (FK → screens),
  start_time (UTC), end_time (UTC), base_price
- **show_seats** — id, show_id (FK → shows), seat_id (FK → seats), status
  (available/held/booked), price (can override seat_type default per show)
- **bookings** — id, user_id (FK → users), show_id (FK → shows), status
  (pending/confirmed/failed/cancelled), idempotency_key (unique),
  total_amount, created_at
- **booking_items** — id, booking_id (FK → bookings), show_seat_id (FK →
  show_seats), price
- **payments** — id, booking_id (FK → bookings), status
  (pending/success/failed), amount, provider_ref, created_at

### Key Constraints & Indexes
- `show_seats`: unique constraint on (show_id, seat_id) — a seat can only
  have one status row per show.
- `bookings.idempotency_key`: unique index — enforces idempotent booking
  confirmation at the DB level, not just application logic.
- Index on `shows(movie_id, start_time)` — powers the "show listing by
  movie + date" query.
- Index on `show_seats(show_id, status)` — powers fast seat-availability
  lookups.
- Foreign keys with `ON DELETE RESTRICT` on anything that would orphan a
  booking record (bookings must never silently lose their seat/show
  reference).
- All timestamps stored in UTC; converted to theatre-local time only at the
  display layer.

## 2. REST API — Endpoint Overview

| Method | Path | Purpose |
|---|---|---|
| POST | /auth/signup | Create account |
| POST | /auth/login | Get JWT |
| GET | /movies/search?q= | Search movies (cached) |
| GET | /movies/{id} | Movie details (cached) |
| GET | /movies/{id}/shows?date= | Shows for a movie on a date |
| GET | /shows/{id}/seats | Seat map + live status |
| POST | /shows/{id}/seats/hold | Attempt to lock selected seats |
| POST | /bookings | Confirm booking (idempotent, requires hold + payment result) |
| POST | /payments/simulate | Simulated payment step (success/fail) |
| GET | /bookings/me | Current user's booking history |
| GET | /bookings/{id} | Single booking detail (ticket view) |

Full request/response schemas to be defined per-endpoint using Pydantic
models as each is implemented — keep this table updated as the source of
truth for what exists vs. planned.

## 3. UI Design Spec

### Visual Direction
Reference: District (by Zomato) — clean, light, confident product UI. NOT a
dark cinematic theme, NOT glassmorphism, NOT default AI-generated gradient
hero patterns.

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `bg-base` | white / off-white (#FFFFFF / #FAFAFA) | Page background |
| `text-primary` | charcoal (#1A1A1A–#222222) | Headings, primary text |
| `text-secondary` | gray (#6B7280 range) | Metadata, secondary text |
| `accent-primary` | purple (#6C4FE0 family) | CTAs, active/selected states, brand |
| `status-success` | green | Confirmed booking, success states |
| `status-error` | orange/red | Failed payment, warnings |
| `seat-available` | light blue/gray | Default seat state |
| `seat-selected` | solid purple/blue | User-selected seat |
| `seat-occupied` | muted gray, disabled | Unavailable seat |

Exact hex values to be finalized in Tailwind config during setup — the
above are directional starting points, not final.

### Typography
- Bold, tight sans-serif for headings/titles (movie titles, section
  headers) — confident weight, no thin/light fonts.
- Max 2–3 weight/size steps per screen: title (bold, large) → metadata
  (regular, gray, small) → body (regular, medium).
- Consider a distinct lowercase wordmark style for the project's own
  branding, echoing the reference's "district" logo treatment.

### Component Patterns
- **Navigation / filters**: fully pill-shaped (rounded-full), not soft
  rounded rectangles.
- **Cards**: rounded-lg/xl, subtle shadow, white background, image + title
  + metadata stacked vertically.
- **Seat map**: uniform small rounded-square buttons in a tight grid,
  color-coded by state per the table above, with a legend row underneath.
- **Carousels**: horizontal scroll for movie posters, cast, events — poster
  led, minimal text overlay.
- **CTA banners**: purple gradient block reserved specifically for
  secondary/next-step prompts (e.g. "download the app" equivalent moments),
  distinct from the plain white card background — used sparingly, not as
  the default card style.
- **Rating badges**: small icon + numeric score in a compact chip.

### React Bits Usage Map
Use sparingly and only where it serves a clear UX purpose — never
decoration for its own sake:
- Movie detail hero: subtle animated text reveal on title/synopsis load.
- Movie/show cards: gentle hover lift or reveal effect on hover (desktop)
  / tap feedback (mobile).
- Seat selection: subtle press/selected-state animation on seat buttons —
  confirms the tap registered, nothing flashy.
- Booking confirmation: a small success-state animation (checkmark
  reveal) — reinforces the "booking confirmed" moment.
- Avoid: particle/3D backgrounds, heavy scroll-triggered animations,
  anything that would slow perceived performance or clash with the clean,
  light, information-dense reference style.

### Responsive Notes
- Mobile-first: seat map must remain usable on small screens — horizontal
  scroll within the seat grid rather than shrinking buttons below tap-target
  size.
- Pill nav collapses to a scrollable row on mobile, matching the reference
  pattern.

## 4. Open Design Decisions (revisit before build)
- Light mode only, or light-default with optional dark mode toggle?
- Final exact hex values and Tailwind theme config.
- Font choice (system font stack vs. a specific bold sans like Inter/
  Manrope/Sora).
