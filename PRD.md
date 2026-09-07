# Product Requirements Document — Movie Booking Platform

## 1. Purpose
This project exists to demonstrate serious full-stack engineering ability for
placement interviews: system design, concurrency handling, caching strategy,
performance measurement, and production deployment — through one cohesive,
well-documented system. It is explicitly NOT a startup MVP and is not trying
to compete with or clone BookMyShow/District as a product. The domain (movie
booking) is a vehicle for demonstrating engineering depth, not the point
itself.

## 2. Target "User" (for scoping purposes)
A single end-user persona: someone browsing movies, picking a show/theatre,
selecting seats, and completing a booking. No multi-role complexity (no
theatre-owner dashboards, no admin CMS) unless explicitly added later as a
stretch feature.

## 3. Core User Stories
1. As a user, I can sign up / log in so my bookings are tied to my account.
2. As a user, I can browse and search movies currently showing, with poster,
   genre, rating, and synopsis data.
3. As a user, I can view a movie's details page (cast, synopsis, rating,
   trailer link if available).
4. As a user, I can see theatres and showtimes for a selected movie.
5. As a user, I can view a seat map for a selected show and see which seats
   are available, held, or booked in near-real-time.
6. As a user, I can select one or more seats and have them temporarily locked
   so another user can't book them while I complete payment.
7. As a user, I can complete a (simulated or test-mode) payment.
8. As a user, I receive a booking confirmation with ticket details on success.
9. As a user, if payment fails, my seat lock is released and I'm told clearly
   what happened.
10. As a user, I can view my booking history.
11. As a user, if I try to book while another user has just taken the same
    seat, I get a clear, immediate error — never a silent double-booking.

## 4. Scope

### MVP
- Auth (signup/login, JWT-based)
- Movie catalog via TMDB, with basic Redis caching
- Seeded theatres, screens, shows (no real theatre-partner integration)
- Seat map UI + seat selection
- Seat locking (Redis TTL gate + Postgres transactional confirm)
- Simulated payment (success/failure paths, no real gateway required)
- Booking confirmation + booking history
- Basic search/filter on movies
- Public deployment (real domain, HTTPS)

### Full Version (post-MVP, worth adding)
- Redis caching with measured hit ratio reporting
- Rate limiting on public endpoints
- Idempotent payment/booking confirm endpoint
- Full test suite: unit, integration, concurrency, e2e
- Load testing with reported p50/p95/p99, RPS, error rate
- Lighthouse/Core Web Vitals optimization with before/after numbers
- CI/CD pipeline
- Basic logging/monitoring
- Optional: test-mode real payment gateway integration (e.g. Stripe test mode)

### Explicit Non-Goals
- No real payment processing requirement (test/sandbox mode is sufficient)
- No admin CMS or theatre-owner portal
- No multi-tenant/multi-role account system
- No native mobile app (web-responsive only)
- No recommendation engine / personalization ML features
- No claim of production-scale traffic handling

## 5. Success Criteria
- End-to-end booking flow works reliably from search → seat select → payment
  → confirmation → history.
- A concurrency test (multiple simulated users booking the same seat
  simultaneously) shows zero double-bookings, with results documented in the
  README.
- Load test results are measured and reported honestly (not inflated), with
  the test methodology and environment spec documented.
- The GitHub repo contains architecture, schema, and design documentation
  sufficient for the author to explain every technical decision in an
  interview.

## 6. Constraints
- Solo developer, part-time (not full-time availability) — see phases.md for
  realistic timeline.
- Must remain primarily a full-stack/system-design/performance project — not
  a DevOps or Agentic AI project (those are separate portfolio pieces).
