---
stage: model-design
bolt: 007-search-capacity
created: 2026-10-30T17:00:00Z
---

## Model, design and decisions: search and capacity (bolt 007)

Stories: SRC-01 capacity per night, SRC-03 reserve and release safely, SRC-04 curated shortlist, SRC-05 home and search entry. Approved under the owner's standing instruction.

### Domain model

- **Night capacity**: (provider, date) with an optional override capacity, a booked count and a note. With no row, the provider's baseline `capacity_small` applies. Free = capacity - booked.
- **Night reservation**: (booking, date) with a released time. It makes reserve and release idempotent per booking.
- **Stay window**: check-in date to check-out date; the nights are check-in up to the day before check-out (exact boundaries, DR-7).
- **Shortlist result**: provider, tier, area, free nights, and the reason shown (tier, area, every night free).

### Design

- Operations live in `apps/api/src/capacity/`: `nights.ts` (availability, reserve, release, set capacity), `search.ts` (shortlist and all-approved), `routes.ts`. Booking bolts call `reserveNights` and `releaseNights` in process.
- **Race safety (DR-8)**: reserve runs in one transaction, creates missing night rows, locks them in date order with `SELECT ... FOR UPDATE`, checks every night, then increments all or none. Two requests for the last slot are serialised by the lock; exactly one wins.
- **Ranking (DR-6)**: tier A first, then neighbourhood density (approved providers in that area), then the smallest free capacity across the window; ties broken by id. No reviews, distance or care fit.
- Search is public (guests may search), reads two queries, and is measured against a p95 under 1 s.

### Decisions (ADR in brief)

- ADR-1: One capacity pool per night (small pets), not per species. The training data has a single pool; per-species counts would be an invented rule. Species only filters which providers can host.
- ADR-2: Capacity changes use "set for these dates"; lowering below booked is refused with the list of nights.
- ADR-3: Bookings per neighbourhood (SRC-06) and peak windows (SRC-02) stay in bolt 019.

### Screens

O1 Home, O3 Results (`/search`), provider page availability strip, P2 Calendar (`/provider/calendar`, plain forms).
