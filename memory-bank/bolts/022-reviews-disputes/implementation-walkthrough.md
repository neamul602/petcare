---
stage: implement
bolt: 022-reviews-disputes
created: 2026-11-01T21:00:00Z
---

## Implementation Walkthrough: moderation, care record and resolving reports (bolt 022)

### Summary

The admin can remove a review for cause (hidden from the public, kept on record, audit-logged) and investigate and resolve a report with a rationale: no action, a refund through the payout rules, and an optional provider action. Providers see a care record counted from their completed, reviewed stays.

### Completed Work

- [x] `apps/api/src/db/schema/reviews.ts`, `drizzle/0017_moderation.sql` - removal and resolution fields
- [x] `apps/api/src/reviews/admin.ts`, `provider-action.ts` - `GET /admin/reviews`, `POST /admin/reviews/:id/remove`, `GET /admin/reports/:id`, `POST /admin/reports/:id/resolve`, `GET /provider/care-record`
- [x] Owner booking view carries the moderation result (read-only)
- [x] Care summary now uses the provider record id (it compared a sign-in id before)
- [x] Web: admin Reviews, Reports list and report detail with the resolve form; owner sees "removed by PetCare"; care record on the provider profile page
- [x] 12 new owner and provider strings and 25 admin strings (553 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). Booking chat is deferred, so the report view says so. A report whose booking is not in dispute cannot be resolved.
