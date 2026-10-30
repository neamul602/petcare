---
stage: test
bolt: 011-booking-stay
created: 2026-10-31T12:45:00Z
---

## Test Report: the stay (bolt 011)

### Summary

- **Tests**: 321 Vitest (13 new stay tests) and 241 Playwright passed (41 skipped by design; 2 new stay journeys). ESLint, TypeScript, Astro check, i18n parity (420 keys) and project checks pass. Accessibility scans of the provider in-stay page and the owner's in-stay page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/stay/stay.integration.test.ts` - start before the date refused, on the date allowed, twice refused, only a confirmed booking of your own; late-start flag at 11:59 and 12:00, once only, never for a started stay; update with note, care log and photos newest first for owner and provider; note-only update; photo limit of 4; photos served only to the booking's two people; edits and deletes refused by the database; bad care log, long note, bad photo type, storage down saves nothing; reminder state at 17:59, 18:00 and after posting; vet clinics for the provider's neighbourhood as a lookup, hidden from other people and from a waiting request
- [x] `tests/e2e/stay.spec.ts` - confirm, start the stay, post two updates (photos, care log, note-only), owner sees them newest first with working photos and call links; a future stay cannot be started
- [x] `apps/api/src/bookings/decision.integration.test.ts` - Today now also returns stays arriving today

### Acceptance Criteria Validation

- ✅ **BKG-10**: starts only on or after the start date; 12:00 flag for the admin
- ✅ **BKG-12**: sheet with up to 4 photos, care log and note; held when offline and sent when back online; immutable; reminder state after 18:00, completion never blocked; photo optional
- ✅ **BKG-14**: clinics for the neighbourhood with name, address, phone, hours and species; tap to call; says it is a lookup
- ✅ **BKG-18**: confirmed shows dates and provider; in stay shows updates newest first and vet clinics; chat and acute banner are deferred or arrive later; completed actions arrive in bolts 013-015

### Issues Found

- None open.
