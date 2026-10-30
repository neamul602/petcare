---
stage: test
bolt: 018-pet-care-profile
created: 2026-11-01T12:10:00Z
---

## Test Report: archive and retention (bolt 018)

### Summary

- **Tests**: 385 Vitest (5 new retention tests) and 252 Playwright passed (52 skipped by design). ESLint, TypeScript, Astro check and project checks pass.

### Test Files

- [x] `apps/api/src/pets/retention.integration.test.ts` - adding months safely (leap day, month ends); archive hides the pet but keeps bookings and care history and the Book flow does not offer it; retention window of 24 months after the last booking, checked either side of the boundary with the injectable clock; deletion refused for an active pet, inside the window, or with booking records; deletion of an archived pet with no booking records as an audited admin event; admin only

### Acceptance Criteria Validation

- ✅ **PET-07**: archive keeps bookings and history; records retained 24 months; deletion outside the window is audited. Not built (deferred): closed-account recovery by OTP re-verification, purge of expired booking-side records; Book again with an archived pet is not offered.
