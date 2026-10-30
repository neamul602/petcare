---
stage: test
bolt: 010-booking-stay
created: 2026-10-31T10:15:00Z
---

## Test Report: provider decision (bolt 010)

### Summary

- **Tests**: 308 Vitest (14 new decision tests) and 239 Playwright passed (39 skipped by design; 4 new provider journeys; payment-failure tests now run in their own late project so they cannot disturb other specs). ESLint, TypeScript, Astro check, i18n parity (378 keys) and project checks pass. Accessibility scans of Today, the request view, the decline sheet, the Bookings list and the owner's declined page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/bookings/decision.integration.test.ts` - Today with time left and groups, privacy between providers, request view without owner contact, pet access follows the request, actions off after the window, confirm captures once and twice is one capture, failed capture leaves the booking waiting and retry works, lost reply still captures once, exactly six decline reasons and no free text, decline releases nights and hold and records care history, timeout at 24 h with the injectable clock, audit signal, confirm racing the last second has one outcome, confirmed bookings never time out, release at a down gateway stays pending
- [x] `tests/e2e/decision.spec.ts` - confirm from Today in two taps, owner sees Confirmed, decline with six reasons and owner sees it, Bookings groups, guest redirect
- [x] `tests/e2e/payment-failures.spec.ts` - declined payment and down gateway (moved from booking.spec)

### Acceptance Criteria Validation

- ✅ **BKG-05, BKG-06**: Today and Bookings with deadlines and an empty state; request view with dates, price, pet copy, care plan, care summary, prior stays highlighted, time left, Confirm primary; expired requests show the state with actions off
- ✅ **BKG-07**: capture once, booking captured, 2 taps from Today, failed capture keeps it waiting with a retry, confirm twice is one capture. (Owner notification deferred.)
- ✅ **BKG-08**: sheet with exactly six reasons and no free text; releases hold and nights; reason on booking and care history. (Owner notification deferred.)
- ✅ **BKG-09**: 24 h timeout closes the request and releases hold and nights; admin signal in the audit log; injectable clock; first action wins. The 12 h peak window arrives with bolt 019. (Owner notification deferred.)

### Issues Found

- The sign-in spec reset every Dummy service between tests, which wiped payment holds made by parallel specs; it now resets only the code service.
