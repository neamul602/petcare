---
stage: plan
bolt: 024-admin-operations
created: 2026-11-02T10:00:00Z
---

## Implementation Plan: urgency queue, audit log and operating ceiling (bolt 024)

Stories: ADM-01 urgency queue, ADM-02 audit log, ADM-03 operating ceiling. Simplest workable version.

- **Queue** (`/admin`): one list sorted by urgency: open acute events, then open reports, then other open items (cancellation requests, no-shows, missed starts), then bookings awaiting provider confirmation (soonest deadline first), then in-stay bookings. Counts for providers to vet and reviews recently posted link to their lists; post-mortem reminders appear; the near-ceiling banner shows. Every row opens its detail in one tap. Empty queue shows a calm state.
- **Audit log** (`/admin/audit`): every admin action already goes to the append-only log. A list endpoint shows entries newest first with filters by action and target. Edit and delete are refused at the API (405) and by the database trigger.
- **Operating ceiling**: active providers against 25 and trailing-30-day completed bookings against 75; a near-ceiling banner from 80 % on Insights and the Queue; a breach is worded as a re-platforming signal, not a goal.
- Provider quality flags on queue rows and the provider list come with bolt 025.
