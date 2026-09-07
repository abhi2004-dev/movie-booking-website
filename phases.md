# Build Phases — Movie Booking Platform

Assumes solo, part-time development (~8–12 hrs/week). Total realistic
timeline: MVP in 6–8 weeks, full portfolio version in an additional 6–10
weeks (~4–5 months total). Do not compress this — the documentation and
measurement work is what makes the project credible, and it's the part
that gets skipped when rushing.

---

## Phase 1 — Foundation & Auth (Weeks 1–2, ~10–14 hrs)
- Repo setup, folder structure per .cursorrules conventions
- Postgres schema + migrations (Alembic) for users, movies, theatres,
  screens, seats, shows, show_seats
- FastAPI project skeleton: routers/services/models/schemas separation
- JWT auth (signup/login)
- Next.js project skeleton, Tailwind config with design.md color tokens
- Base UI shell: pill nav, layout, typography scale
- **Dependency**: none. **Exit criteria**: can sign up/log in, empty
  catalog page renders with correct visual style.

## Phase 2 — Movie Catalog & Browsing (Weeks 2–3, ~8–10 hrs)
- TMDB integration in backend, Redis caching layer for search/details
- Movie search/browse UI with cards (React Bits hover effect)
- Movie details page (hero, cast, synopsis)
- Seeded theatres/screens/shows data (script or fixtures)
- **Dependency**: Phase 1. **Exit criteria**: can search/browse real TMDB
  data, cache hit visible in logs on repeat queries.

## Phase 3 — Shows, Seat Map & Locking (Weeks 3–5, ~14–18 hrs)
- Show listing by movie + date
- Seat map UI (grid, color-coded states, legend)
- Seat hold endpoint: Redis SETNX+TTL gate
- Seat availability endpoint cross-checking Redis holds + Postgres status
- Concurrency test: simulate two simultaneous hold attempts on the same
  seat, verify only one succeeds
- **Dependency**: Phase 2. **Exit criteria**: seat map reflects live
  availability; concurrent-hold test passes.

## Phase 4 — Booking & Payment Simulation (Weeks 5–6, ~10–12 hrs)
- Booking confirm endpoint with idempotency key + Postgres transaction
- Simulated payment endpoint (success/fail paths)
- Booking confirmation UI + ticket view
- Booking history page
- Lock expiry test (verify seat reverts to available after TTL with no
  payment)
- Duplicate-request/idempotency test
- **Dependency**: Phase 3. **Exit criteria**: full booking flow works
  end-to-end, including failure paths. **This is the MVP completion
  point.**

## Phase 5 — Hardening: Caching, Rate Limiting, Idempotency (Weeks 7–8,
~8–10 hrs)
- Rate limiting on public endpoints (Redis-backed)
- Cache hit-ratio logging/reporting
- Redis-down and DB-down failure-mode handling (fail closed per
  architecture.md)
- Review and tighten all idempotency logic
- **Dependency**: Phase 4. **Exit criteria**: documented failure-mode
  behavior matches architecture.md; rate limiting demonstrably works.

## Phase 6 — Testing Suite (Weeks 9–10, ~10–12 hrs)
- Unit tests (services layer)
- Integration/API tests (endpoints)
- Concurrency tests formalized (multiple simulated users, same seat)
- E2E tests (critical user flow: search → book → confirm)
- **Dependency**: Phase 5. **Exit criteria**: test suite runs in CI,
  meaningful coverage on booking/locking logic specifically.

## Phase 7 — Performance & Load Testing (Weeks 11–12, ~10–14 hrs)
- Frontend: Lighthouse audit, before/after optimization (image
  optimization, code splitting, lazy loading)
- Backend: identify and fix N+1 queries, add missing indexes, measure
  before/after query times
- Load testing with k6 or Locust: concurrent users, RPS, p50/p95/p99
  latency, error rate, cache hit ratio, resource usage
- Document all results honestly in README — no inflated numbers, use
  `<TBD>` placeholders until actually measured
- **Dependency**: Phase 6. **Exit criteria**: README has real, reproducible
  performance data with methodology described.

## Phase 8 — Deployment & Documentation (Weeks 13–14, ~10–12 hrs)
- AWS deployment: RDS, EC2/ECS, domain + HTTPS via Route53/ACM
- Environment variable / secrets management
- Basic logging setup
- CI/CD pipeline (build + test on push, deploy on merge to main)
- Final documentation pass: architecture diagram, ER diagram, API docs,
  README with setup instructions, all trade-offs and limitations documented
- **Dependency**: Phase 7. **Exit criteria**: publicly accessible via real
  domain over HTTPS, README is interview-ready.

---

## Suggested Weekly Rhythm
- 2–3 sessions/week of ~3–4 hrs each is more sustainable than one long
  weekend block, especially since concurrency/locking work benefits from
  fresh-eyes debugging rather than marathon sessions.
- Reserve the last week of each phase for testing/cleanup before moving on
  — don't let untested code accumulate across phases.
