---
stage: implement
bolt: 009-booking-stay
created: 2026-10-30T21:00:00Z
---

## Implementation Walkthrough: booking request (bolt 009)

### Summary

An owner can book a provider: choose the pet and dates, confirm the care plan, see the price and send the request with a payment hold. They land on a booking page showing who they are waiting for, until when and how much is on hold, and can cancel before the provider answers.

### Completed Work

- [x] `packages/shared/src/bookings.ts` - states, transitions, pills
- [x] `apps/api/src/db/schema/bookings.ts`, `drizzle/0008_bookings.sql`
- [x] `apps/api/src/bookings/{transitions,booking-service,routes}.ts` - `POST /owner/bookings`, `GET /owner/bookings/:id`, `POST /owner/bookings/:id/cancel`
- [x] `apps/api/src/capacity/nights.ts` - reserve now re-checks after taking the locks so a twin request cannot count a booking twice
- [x] Web: `components/book/BookFlow.tsx`, `pages/book/[providerSlug].astro`, `pages/bookings/[id].astro`, `bookings/[id]/cancel.ts`, StatePill gets canceled, no-show and resolved, `lib/text.ts`
- [x] 63 new strings (340 keys, parity passes)

### Key Decisions

- See the plan. In short: reserve then authorize then create; one key one booking; new key after a decline; deadline from the base window.

### Deviations from Plan

- Placeholder routes `/book/sample-provider` and `/bookings/sample-booking` removed from the route list.
- The Bookings list (O7) stays a placeholder until its story (BKG-17) in a later bolt.
