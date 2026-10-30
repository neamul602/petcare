---
stage: model-design
bolt: 013-booking-stay
created: 2026-10-31T16:00:00Z
---

## Model, design and decisions: completion and cancellations (bolt 013)

Stories: BKG-15 mark complete and confirm completion, BKG-11 cancellations and no-shows. Approved under the owner's standing instruction.

### Decisions

- **Q-S1 (owner never confirms completion)**: decided. The admin can complete a stay after its end date, with a reason, and the same effects follow (review opens, payout queued). Audit-logged.
- **Completion** is a request, not a state: the provider's Mark complete sets "completion requested" (allowed from the end date, even with missed updates or an acute event); the owner's confirmation moves in_stay to completed, records the care history and queues the payout. No new state is needed.
- **After confirmation, nothing is automatic (TD-6)**: an owner cancellation is a request in the admin queue; a provider cancellation is a queue item for the admin to reassign or refund in full; an owner no-show (flagged by the provider from the start date) moves the booking to no_show and waits for the admin; a missed stay start (the 12:00 check) becomes a queue item. No automatic refund anywhere.
- **Admin queue items** are `booking_flags` (kind, status, note, who raised it, resolution). Resolving a cancellation with a refund refunds through the payment port (up to what was captured), releases the nights and cancels the booking; "no action" keeps it confirmed. Resolving a no-show either refunds (booking refunded, payout recalculated) or keeps the funds (payout queued).
- Admin queue screen is bolt 024; this bolt adds the data and the endpoints.
