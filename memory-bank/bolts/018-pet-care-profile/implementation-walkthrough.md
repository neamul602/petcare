---
stage: implement
bolt: 018-pet-care-profile
created: 2026-11-01T12:00:00Z
---

## Implementation Walkthrough: archive and retention (bolt 018)

### Summary

Archiving a pet keeps its bookings and history. Records are kept for 24 months after the last booking; the admin can see a pet's retention status and delete an archived pet's records once outside the window, as an audited event.

### Completed Work

- [x] `apps/api/src/pets/retention.ts` - `GET /admin/retention/pets/:id`, `DELETE /admin/records/pets/:id`
- [x] Book again no longer pre-selects an archived pet (`book-again.ts`, `BookFlow.tsx`)

### Key Decisions

- Simplest workable version (see the plan). The 24-month value already lives in `platformRules.retentionMonths`.
- Deferred to `deferred-scope.md`: owner account closure with OTP re-verification, and purging expired booking-side records.
