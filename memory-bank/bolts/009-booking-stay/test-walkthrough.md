---
stage: test
bolt: 009-booking-stay
created: 2026-10-30T21:15:00Z
---

## Test Report: booking request (bolt 009)

### Summary

- **Tests**: 294 Vitest (17 new booking tests) and 241 Playwright passed (36 skipped by design, 6 new booking journeys). ESLint, TypeScript, Astro check, i18n parity (340 keys), config literals, no-Dummy-in-web, contrast pass. Accessibility scans of Book steps 1 and 3, the clinical block, the waiting page and the no-pet state show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/bookings/bookings.integration.test.ts` - transitions table, pill names, illegal transition rejected, racing changes (one wins), log with trigger and time; Bibi books Rashid for 8 nights: BDT 20,000 held, nights reserved, 24 h deadline; double tap and five simultaneous sends make one booking, one hold, one reservation; full night blocks before any charge; decline, gateway down and lost reply leave nothing behind and retry works with no second hold; pet, provider, species, date and clinical checks; pet copy unaffected by later edits; sign-in and role guards; other owner cannot see a booking; cancel frees nights and releases the hold, twice refused, cancel while gateway down shows release pending; moved-on booking cannot be cancelled here
- [x] `tests/e2e/booking.spec.ts` - full flow to the waiting page and cancel, a full night shown before continuing, clinical block and confirmation, declined payment and down gateway with inputs kept, guest redirect and no-pet state, unknown booking 404

### Acceptance Criteria Validation

- ✅ **BKG-01**: only allowed transitions; every change logged; same pill everywhere
- ✅ **BKG-02**: pet and dates (inline add pet link, archived pets not offered), full nights told before continuing, pre-filled care plan with a use-saved toggle, clinical purpose stops the flow, inputs survive a reload
- ✅ **BKG-03**: price breakdown, cancellation rule and "only charged when confirmed"; submit reserves nights, creates the booking (requested to authorized) and opens the booking page; offline submit is held and sent once; double tap makes one booking
- ✅ **BKG-04**: "Waiting for Rashid", deadline and hold amount; cancel releases nights and hold; page shows the new state on return

### Issues Found

- A declined payment stayed declined on retry with the same reference; the screen now starts a new reference after a decline (found by the browser test).
- Offline hold is implemented but only covered by the review-step logic, not simulated in a browser test; the offline banner is covered in the PWA spec.
