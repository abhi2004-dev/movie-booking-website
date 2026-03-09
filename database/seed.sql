-- ─── MOVIES ──────────────────────────────────────────────────────────────────
INSERT INTO movies (id, title, description, duration, language, genre, rating, release_year, poster_url, trailer_url) VALUES
(
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Pushpa 2: The Rule',
  'The sequel to the blockbuster Pushpa: The Rise. Pushpa Raj continues his red sandalwood smuggling empire while facing an intense rivalry with the police.',
  202, 'Telugu', '{Action,Drama,Thriller}', 8.1, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000002',
  'Kalki 2898 AD',
  'A dystopian sci-fi epic set in the future, blending Hindu mythology with futuristic storytelling in a grand cinematic universe.',
  181, 'Telugu', '{Action,Sci-Fi,Fantasy}', 8.4, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000003',
  'Stree 2',
  'The horror-comedy franchise returns with a new supernatural threat terrorizing the town of Chanderi.',
  135, 'Hindi', '{Horror,Comedy}', 8.9, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000004',
  'Marco',
  'A gritty and intense action thriller following a man pushed to his limits who takes on a criminal empire single-handedly.',
  163, 'Malayalam', '{Action,Thriller}', 8.7, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000005',
  'Lucky Baskhar',
  'A middle-class bank employee gets entangled in a money laundering scheme and must navigate between greed, family and morality.',
  158, 'Telugu', '{Thriller,Drama,Crime}', 8.3, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000006',
  'Devara',
  'A fearless man who once ruled the seas must reclaim his legacy decades later when his past resurfaces.',
  176, 'Telugu', '{Action,Drama}', 7.6, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000007',
  'Singham Again',
  'The fearless cop Bajirao Singham returns for another high-octane mission to rescue his wife and defeat a powerful villain.',
  170, 'Hindi', '{Action}', 6.8, 2024, '', ''
),
(
  'a1b2c3d4-0001-0001-0001-000000000008',
  'The Sabarmati Report',
  'A journalist uncovers the truth behind a controversial train burning incident that shook the nation.',
  130, 'Hindi', '{Drama,Thriller}', 8.2, 2024, '', ''
);

-- ─── VENUES ──────────────────────────────────────────────────────────────────
INSERT INTO venues (id, name, city, address, total_screens) VALUES
(
  'b1b2c3d4-0001-0001-0001-000000000001',
  'PVR Cinemas Koramangala',
  'Bengaluru',
  'Forum Mall, Hosur Road, Koramangala, Bengaluru - 560095',
  4
),
(
  'b1b2c3d4-0001-0001-0001-000000000002',
  'INOX Mantri Mall',
  'Bengaluru',
  'Mantri Square Mall, Sampige Road, Malleshwaram, Bengaluru - 560003',
  3
),
(
  'b1b2c3d4-0001-0001-0001-000000000003',
  'Cinepolis Orion Mall',
  'Bengaluru',
  'Orion Mall, Dr. Rajkumar Road, Rajajinagar, Bengaluru - 560010',
  5
),
(
  'b1b2c3d4-0001-0001-0001-000000000004',
  'PVR Phoenix Marketcity',
  'Bengaluru',
  'Phoenix Marketcity, Whitefield Main Road, Whitefield, Bengaluru - 560066',
  6
),
(
  'b1b2c3d4-0001-0001-0001-000000000005',
  'SPI Sathyam Cinemas',
  'Chennai',
  '8, Thiru Vi Ka Road, Anna Salai, Chennai - 600002',
  4
);

-- ─── SCREENS ─────────────────────────────────────────────────────────────────
INSERT INTO screens (id, venue_id, screen_name, total_rows, seats_per_row) VALUES
('c1000001-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'Screen 1',       11, 12),
('c1000001-0001-0001-0001-000000000002', 'b1b2c3d4-0001-0001-0001-000000000001', 'Screen 2 - IMAX', 11, 12),
('c1000001-0001-0001-0001-000000000003', 'b1b2c3d4-0001-0001-0001-000000000002', 'Screen 1',        11, 12),
('c1000001-0001-0001-0001-000000000004', 'b1b2c3d4-0001-0001-0001-000000000003', 'Screen 1',        11, 12),
('c1000001-0001-0001-0001-000000000005', 'b1b2c3d4-0001-0001-0001-000000000004', 'Screen 1',        11, 12),
('c1000001-0001-0001-0001-000000000006', 'b1b2c3d4-0001-0001-0001-000000000005', 'Screen 1',        11, 12);

-- ─── SEATS (Screen 1 — rows A-K, 12 seats each) ───────────────────────────────
DO $$
DECLARE
  screen_ids UUID[] := ARRAY[
    'c1000001-0001-0001-0001-000000000001'::UUID,
    'c1000001-0001-0001-0001-000000000002'::UUID,
    'c1000001-0001-0001-0001-000000000003'::UUID,
    'c1000001-0001-0001-0001-000000000004'::UUID,
    'c1000001-0001-0001-0001-000000000005'::UUID,
    'c1000001-0001-0001-0001-000000000006'::UUID
  ];
  rows TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','J','K'];
  sid  UUID;
  r    TEXT;
  s    INTEGER;
  cat  VARCHAR(10);
BEGIN
  FOREACH sid IN ARRAY screen_ids LOOP
    FOREACH r IN ARRAY rows LOOP
      FOR s IN 1..12 LOOP
        IF r IN ('A','B') THEN
          cat := 'premium';
        ELSIF r IN ('C','D','E','F','G') THEN
          cat := 'gold';
        ELSE
          cat := 'silver';
        END IF;
        INSERT INTO seats (screen_id, row_label, seat_number, seat_code, category)
        VALUES (sid, r, s, r || s, cat)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ─── SHOWTIMES (Today + Tomorrow for all movies across screens) ───────────────
INSERT INTO showtimes (movie_id, screen_id, show_date, show_time, price_premium, price_gold, price_silver) VALUES
-- Pushpa 2
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '10:15:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '13:30:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '16:45:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '20:00:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE + 1, '10:15:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE + 1, '13:30:00', 400, 280, 160),
('a1b2c3d4-0001-0001-0001-000000000001','c1000001-0001-0001-0001-000000000001', CURRENT_DATE + 1, '20:00:00', 400, 280, 160),
-- Kalki 2898 AD
('a1b2c3d4-0001-0001-0001-000000000002','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '10:15:00', 350, 240, 140),
('a1b2c3d4-0001-0001-0001-000000000002','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '14:00:00', 350, 240, 140),
('a1b2c3d4-0001-0001-0001-000000000002','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '20:00:00', 350, 240, 140),
('a1b2c3d4-0001-0001-0001-000000000002','c1000001-0001-0001-0001-000000000002', CURRENT_DATE + 1, '13:30:00', 350, 240, 140),
('a1b2c3d4-0001-0001-0001-000000000002','c1000001-0001-0001-0001-000000000002', CURRENT_DATE + 1, '20:00:00', 350, 240, 140),
-- Stree 2
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE,     '10:15:00', 300, 210, 120),
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE,     '13:30:00', 300, 210, 120),
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE,     '16:45:00', 300, 210, 120),
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE,     '20:00:00', 300, 210, 120),
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE + 1, '13:30:00', 300, 210, 120),
('a1b2c3d4-0001-0001-0001-000000000003','c1000001-0001-0001-0001-000000000003', CURRENT_DATE + 1, '20:00:00', 300, 210, 120),
-- Marco
('a1b2c3d4-0001-0001-0001-000000000004','c1000001-0001-0001-0001-000000000004', CURRENT_DATE,     '10:15:00', 320, 220, 130),
('a1b2c3d4-0001-0001-0001-000000000004','c1000001-0001-0001-0001-000000000004', CURRENT_DATE,     '16:45:00', 320, 220, 130),
('a1b2c3d4-0001-0001-0001-000000000004','c1000001-0001-0001-0001-000000000004', CURRENT_DATE,     '20:00:00', 320, 220, 130),
('a1b2c3d4-0001-0001-0001-000000000004','c1000001-0001-0001-0001-000000000004', CURRENT_DATE + 1, '13:30:00', 320, 220, 130),
('a1b2c3d4-0001-0001-0001-000000000004','c1000001-0001-0001-0001-000000000004', CURRENT_DATE + 1, '20:00:00', 320, 220, 130),
-- Lucky Baskhar
('a1b2c3d4-0001-0001-0001-000000000005','c1000001-0001-0001-0001-000000000005', CURRENT_DATE,     '10:15:00', 280, 195, 110),
('a1b2c3d4-0001-0001-0001-000000000005','c1000001-0001-0001-0001-000000000005', CURRENT_DATE,     '13:30:00', 280, 195, 110),
('a1b2c3d4-0001-0001-0001-000000000005','c1000001-0001-0001-0001-000000000005', CURRENT_DATE,     '20:00:00', 280, 195, 110),
('a1b2c3d4-0001-0001-0001-000000000005','c1000001-0001-0001-0001-000000000005', CURRENT_DATE + 1, '20:00:00', 280, 195, 110),
-- Devara
('a1b2c3d4-0001-0001-0001-000000000006','c1000001-0001-0001-0001-000000000006', CURRENT_DATE,     '10:15:00', 310, 215, 125),
('a1b2c3d4-0001-0001-0001-000000000006','c1000001-0001-0001-0001-000000000006', CURRENT_DATE,     '16:45:00', 310, 215, 125),
('a1b2c3d4-0001-0001-0001-000000000006','c1000001-0001-0001-0001-000000000006', CURRENT_DATE,     '20:00:00', 310, 215, 125),
('a1b2c3d4-0001-0001-0001-000000000006','c1000001-0001-0001-0001-000000000006', CURRENT_DATE + 1, '13:30:00', 310, 215, 125),
-- Singham Again
('a1b2c3d4-0001-0001-0001-000000000007','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '13:30:00', 260, 185, 100),
('a1b2c3d4-0001-0001-0001-000000000007','c1000001-0001-0001-0001-000000000001', CURRENT_DATE,     '20:00:00', 260, 185, 100),
('a1b2c3d4-0001-0001-0001-000000000007','c1000001-0001-0001-0001-000000000001', CURRENT_DATE + 1, '16:45:00', 260, 185, 100),
-- The Sabarmati Report
('a1b2c3d4-0001-0001-0001-000000000008','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '10:15:00', 240, 175, 95),
('a1b2c3d4-0001-0001-0001-000000000008','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '13:30:00', 240, 175, 95),
('a1b2c3d4-0001-0001-0001-000000000008','c1000001-0001-0001-0001-000000000002', CURRENT_DATE,     '20:00:00', 240, 175, 95),
('a1b2c3d4-0001-0001-0001-000000000008','c1000001-0001-0001-0001-000000000002', CURRENT_DATE + 1, '20:00:00', 240, 175, 95);