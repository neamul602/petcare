---
stage: implement
bolt: 013-booking-stay
created: 2026-10-31T18:00:00Z
---

## Implementation Walkthrough: completion and cancellations (bolt 013)

### Summary

A stay ends in two steps: the provider marks it complete (from its end date, even with missed updates) and the owner confirms; the booking becomes completed, the care history is recorded and the payout is queued. If the owner never confirms, the admin can complete it after the end date (Q-S1 decided). After confirmation, cancellations and no-shows are never automatic: they are items for the admin to decide.

### Completed Work

- [x] `apps/api/src/db/schema/bookings.ts`, `drizzle/0011_completion.sql` - completion times on bookings and a `booking_flags` table (the admin queue items)
- [x] `apps/api/src/bookings/{flags,completion-service,completion-routes}.ts`
- [x] Owner: confirm completion, ask to cancel a confirmed booking. Provider: mark complete, cancel with a reason, report a no-show. Admin: complete after the end date, resolve a cancellation (refund in full, partial, or no action), resolve a no-show (keep funds or refund), list and resolve queue items
- [x] The 12:00 missed-start check now also creates a queue item
- [x] Web: confirm-completion card, cancellation request and status messages on the owner page; Mark complete, Cancel and no-show on the provider page
- [x] 20 new strings (440 keys, parity passes)

### Key Decisions

- See the plan (completion is a request, not a new state; Q-S1; no automatic refund after confirmation).
- No admin screen yet: the queue is the admin API until bolt 024.
- "Reassign" is handled by the admin refunding in full; the owner can book another provider.
