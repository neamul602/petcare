---
stage: test
bolt: 016-accounts-notifications
created: 2026-10-31T23:10:00Z
---

## Test Report: settings (bolt 016)

### Summary

- **Tests**: 375 Vitest (5 new settings tests) and 250 Playwright passed (50 skipped by design; 2 new journeys). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of both settings pages show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/auth/settings.integration.test.ts` - read settings with the read-only phone, save name and language, phone never changes and bad input is refused, providers work and admins are refused on the user route, admin name change audit-logged
- [x] `tests/e2e/settings.spec.ts` - owner changes name and language and the whole app follows; provider changes name

### Acceptance Criteria Validation

- ✅ **ACC-05**: name and language saved and used everywhere; verified phone read-only; admin settings English only. Notification choices are deferred with the notification system.

### Issues Found

- None.
