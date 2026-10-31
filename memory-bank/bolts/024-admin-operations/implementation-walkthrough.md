---
stage: implement
bolt: 024-admin-operations
created: 2026-11-02T12:00:00Z
---

## Implementation Walkthrough: queue, audit log and operating ceiling (bolt 024)

### Summary

The admin's home is one urgency-sorted queue; the audit log is readable and immutable; the operating ceiling is shown against 25 providers and 75 completed bookings a month with a near-ceiling banner.

### Completed Work

- [x] `apps/api/src/admin/queue.ts` - `GET /admin/queue`, `GET /admin/insights/ceiling`, `GET /admin/audit` (filters), `PUT/PATCH/DELETE /admin/audit/:id` refused with 405, `GET /admin/bookings/:id` (record, open items, history, money)
- [x] Web: Queue page with the ceiling banner, counts, reminders and rows; Audit log page with filters; admin booking page with decision forms for cancellations, no-shows, missed starts and completing a stay (Q-S1); ceiling on Insights
- [x] 40 new admin strings (parity passes)

### Key Decisions

- Simplest workable version (see the plan). Provider quality flags on rows come with bolt 025.
- Queue order: acute events, reports, other open items, bookings awaiting confirmation (soonest first), in-stay bookings.
