-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  phone        VARCHAR(15) UNIQUE,
  password     VARCHAR(255),
  google_id    VARCHAR(255),
  role         VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ─── MOVIES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  duration     INTEGER NOT NULL,         -- in minutes
  language     VARCHAR(50) NOT NULL,
  genre        TEXT[] NOT NULL,          -- array e.g. {Action, Drama}
  rating       DECIMAL(3,1) DEFAULT 0.0,
  release_year INTEGER,
  poster_url   VARCHAR(500),
  trailer_url  VARCHAR(500),
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── VENUES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(200) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  address      TEXT NOT NULL,
  total_screens INTEGER DEFAULT 1,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── SCREENS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS screens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id     UUID REFERENCES venues(id) ON DELETE CASCADE,
  screen_name  VARCHAR(50) NOT NULL,     -- e.g. "Screen 1", "IMAX"
  total_rows   INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── SHOWTIMES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS showtimes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id     UUID REFERENCES movies(id) ON DELETE CASCADE,
  screen_id    UUID REFERENCES screens(id) ON DELETE CASCADE,
  show_date    DATE NOT NULL,
  show_time    TIME NOT NULL,
  price_premium DECIMAL(8,2) NOT NULL,
  price_gold    DECIMAL(8,2) NOT NULL,
  price_silver  DECIMAL(8,2) NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(screen_id, show_date, show_time)
);

-- ─── SEATS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screen_id    UUID REFERENCES screens(id) ON DELETE CASCADE,
  row_label    VARCHAR(5) NOT NULL,      -- A, B, C ...
  seat_number  INTEGER NOT NULL,         -- 1, 2, 3 ...
  seat_code    VARCHAR(10) NOT NULL,     -- A1, B5, etc.
  category     VARCHAR(10) NOT NULL CHECK (category IN ('premium', 'gold', 'silver')),
  UNIQUE(screen_id, seat_code)
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  showtime_id     UUID REFERENCES showtimes(id) ON DELETE SET NULL,
  seats           TEXT[] NOT NULL,       -- array of seat codes e.g. {A1, A2}
  total_amount    DECIMAL(10,2) NOT NULL,
  convenience_fee DECIMAL(10,2) NOT NULL,
  grand_total     DECIMAL(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','refunded')),
  payment_id      VARCHAR(200),          -- Razorpay payment ID
  order_id        VARCHAR(200),          -- Razorpay order ID
  booked_at       TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── BOOKED SEATS (for fast lookups) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booked_seats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  showtime_id  UUID REFERENCES showtimes(id) ON DELETE CASCADE,
  seat_code    VARCHAR(10) NOT NULL,
  booking_id   UUID REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE(showtime_id, seat_code)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_showtimes_movie    ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_date     ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user      ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime  ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_booked_seats_show  ON booked_seats(showtime_id);
CREATE INDEX IF NOT EXISTS idx_seats_screen       ON seats(screen_id);