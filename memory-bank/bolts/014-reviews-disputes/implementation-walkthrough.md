---
stage: implement
bolt: 014-reviews-disputes
created: 2026-10-31T20:30:00Z
---

## Implementation Walkthrough: reviews and report a problem (bolt 014)

### Summary

After a completed stay the owner can review it (rating, text, photos from the stay) and, within 72 hours, report a problem. Reviews appear on the provider's public page with real aggregates; a report disputes the booking, freezes the payout and shows in the admin's list.

### Completed Work

- [x] `apps/api/src/db/schema/reviews.ts`, `drizzle/0012_reviews.sql` - reviews and reports
- [x] `apps/api/src/reviews/{service,routes}.ts` - leave review, report, public reviews and photos, aggregates, admin report list, report categories
- [x] Public provider response now carries real aggregates (count, average, share with photos); owner booking view carries review, report and their windows
- [x] Web: review form and report sheet on the owner's completed booking page; reviews and summary on the public provider page (New-provider message when none)
- [x] 26 new strings (467 keys, parity passes)

### Key Decisions

- Simplest workable design (see the plan): review photos are chosen from the photos the provider posted during the stay, so there is no new upload path and photos always come from the stay window.
- Public review photos are served only while their review is published.
- Moderation, the provider care record and investigation are bolt 022.
