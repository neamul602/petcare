---
stage: test
bolt: 021-provider-supply-vetting
created: 2026-11-01T18:40:00Z
---

## Test Report: vetting and the provider profile (bolt 021)

### Summary

- **Tests**: 405 Vitest (10 new vetting and profile tests, plus an updated provider lifecycle test) and 257 Playwright passed (57 skipped by design; 2 new journeys, 1 updated). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the admin vetting and appeals views, the decisions list and the provider profile show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/providers/vetting.integration.test.ts` - approval blocked with the missing checks listed; Tier-A needs outreach; request for information shows awaiting info and clears on update; artifacts and notes never appear in any public, owner or provider response; every change audit-logged; appeals recorded only for a declined provider with an outcome; decisions list with reasons; profile saved and shown on the public page, missing list, tier and status not editable, input validation, capacity per size refused
- [x] `tests/e2e/vetting.spec.ts` - vetting gate, request for information, appeal, decisions list; provider edits profile text and the public page shows it
- [x] `tests/e2e/providers.spec.ts` - updated for the vetting gate

### Acceptance Criteria Validation

- ✅ **SUP-02**: criteria visible; artifacts stored apart and never public; approval blocked until identity, address and capability are complete; Tier-A needs a recorded outreach; decisions audit-logged with reasons; request more information shows awaiting info
- ✅ **SUP-03**: appeals and outcomes recorded; approvals and declines listed with reasons
- ✅ **SUP-05**: edits appear on the public page; completeness lists what is missing; capacity per size not built; tier not editable

### Issues Found

- None open.
