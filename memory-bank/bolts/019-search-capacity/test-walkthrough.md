---
stage: test
bolt: 019-search-capacity
created: 2026-11-01T14:10:00Z
---

## Test Report: peak windows and neighbourhood counts (bolt 019)

### Summary

- **Tests**: 391 Vitest (6 new) and 254 Playwright passed (54 skipped by design; 2 new journeys). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the provider calendar with a peak prompt and the admin Insights page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/capacity/peak.integration.test.ts` - admin-only creation and date check; boundary of a peak stay (last night versus first night); 12 h versus 24 h confirmation window; Tier-A 8 % in peak, 10 % outside, Tier-B 16 %; Expand for peak sets all nights and reopens full nights, calendar marks peak nights, lowering below bookings refused, role guards; neighbourhood counts per month in Dhaka time, completed only, admin only
- [x] `tests/e2e/peak.spec.ts` - admin adds a window and sees the table; provider sees the prompt and Tier-A note and expands

### Acceptance Criteria Validation

- ✅ **SRC-02**: peak prompt with the Tier-A commission note; one action sets every night and reopens full ones; peak nights marked; raising always allowed
- ✅ **SRC-06**: counts per neighbourhood per month; expansion is an admin decision, nothing auto-expands

### Issues Found

- None.
