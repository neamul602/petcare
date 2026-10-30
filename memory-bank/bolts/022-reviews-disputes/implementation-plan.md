---
stage: plan
bolt: 022-reviews-disputes
created: 2026-11-01T19:30:00Z
---

## Implementation Plan: moderation, care record and resolving reports (bolt 022)

Stories: REV-03 moderate reviews for cause, REV-04 provider care record, REV-06 investigate and resolve a report. Booking chat is deferred, so the report view shows the other records without it. Simplest workable version.

- **Moderation** (admin): list recent reviews; remove one with a reason (abuse, off-topic, off-platform contact details) and a note. A removed review is hidden from the public, stays stored, is audit-logged, and the owner sees the result read-only on the booking. Reviews rated 1-3 come back with a reminder not to remove a review for being negative. Moderation never touches a report.
- **Care record** (provider): counts of completed, reviewed stays by care need (diabetic, senior, medication, anxious, extra attention) from those bookings' care plans, with an empty state. Never used for ranking.
- **Report investigation** (admin): one view with the booking record, the pet's care history, the stay updates, the provider's decline patterns and the booking's review. Resolution needs a written rationale and is one of: no action (the payout freeze is released and the booking is resolved), a refund up to the captured amount (through the payout rules; the booking is refunded), and optionally a provider action (warning, suspension or removal) which can be taken without a refund. Every step is audit-logged; the owner's review is left as it is.
