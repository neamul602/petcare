---
stage: test
bolt: 006-provider-supply-vetting
created: 2026-10-30T16:30:00Z
---

## Test Report: provider supply (bolt 006)

### Summary

- **Tests**: 232 Vitest (11 new provider API tests) and 240 Playwright passed (23 skipped by design, 5 new provider journeys). ESLint, TypeScript, Astro check, i18n parity (228 keys), config literals, no-Dummy-in-web and contrast all pass. Accessibility scans of the public page (Bangla and English), admin list and admin detail show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/providers/providers.integration.test.ts` - creation by admin only (401 guest, 403 owner), unknown area and third tier refused, lifecycle and skipped steps refused, completeness before approval, reasons required, tier change with history and audit entry, admin list and filter, bookable check, no public create route, public page privacy (no phone or account), Tier-B, not-found for non-approved
- [x] `tests/e2e/providers.spec.ts` - public page in Bangla with badge name, English Tier-B without badge, 404 for pending and unknown, admin creates a record, moves status, sees the profile-incomplete rule, changes tier with a reason

### Acceptance Criteria Validation

- ✅ **SUP-01** tier and status at creation; lifecycle order; not returned unless approved; suspended/removed not bookable; tier change needs reason and is audit-logged
- ✅ **SUP-04** photos area, services, price, area, capacity, capabilities, experience; Tier-A badge with accessible name; no verification data; new-provider message; Book opens the flow (`/book/:slug`)

### Issues Found

- None open. Refusing a request or confirmation for suspended providers is enforced later in the booking bolts through `isProviderBookable`.
