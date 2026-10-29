---
stage: implement
bolt: 007-search-capacity
created: 2026-10-30T18:00:00Z
---

## Implementation Walkthrough: search and capacity (bolt 007)

### Summary

Providers have a capacity for every night; the platform reserves and releases a whole stay at once without ever double-booking; owners search and get a ranked short list of 3-5 providers free every night, with the reason shown.

### Completed Work

- [x] `apps/api/src/db/schema/capacity.ts`, `drizzle/0006_capacity.sql` - night capacity (with a non-negative booked check) and night reservations
- [x] `apps/api/src/capacity/dates.ts` - Dhaka dates, exact night boundaries, window checks (past, order, 30 nights)
- [x] `apps/api/src/capacity/nights.ts` - `nightsFor`, `reserveNights`, `releaseNights`, `setCapacity`
- [x] `apps/api/src/capacity/search.ts` - shortlist and View all approved
- [x] `apps/api/src/capacity/routes.ts` - `GET /provider/calendar`, `PUT /provider/capacity`, `GET /search`, `GET /providers/:slug/availability`
- [x] Web: new home, `/search` results, shared `SearchForm`, availability on the provider page (dates carried to Book), `/provider/calendar` with `calendar/save.ts`, `lib/dates.ts`
- [x] 49 new strings (277 keys, parity passes)

### Key Decisions

- Reserve locks every night row in date order inside one transaction, so the last slot goes to exactly one request; reserve and release are safe to repeat per booking.
- Capacity is one pool per night (see ADR-1 in the plan); species only decides which providers can host.
- Ranking uses tier, then neighbourhood density, then free capacity, then id. No reviews, distance or sponsorship fields exist in the response.
- Search is public so guests can look before signing in.

### Deviations from Plan

- None. The book-again card on the home screen waits for bolt 017; peak windows and bookings per neighbourhood stay in bolt 019.

### Developer Notes

- Booking bolts call `reserveNights(db, {bookingId, providerId, from, to})` at submission and `releaseNights(db, bookingId)` on decline, timeout or cancellation.
