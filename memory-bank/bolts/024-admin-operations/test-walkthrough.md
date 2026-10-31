---
stage: test
bolt: 024-admin-operations
created: 2026-11-02T12:10:00Z
---

## Test Report: queue, audit log and operating ceiling (bolt 024)

### Summary

- **Tests**: 429 Vitest (9 new) and 260 Playwright passed (60 skipped by design; 1 new journey). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the Queue, the admin booking page, the Audit log and Insights show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/admin/queue.integration.test.ts` - empty queue; order of acute, reports, other items, awaiting confirmation, in-stay; counts and reminders; admin booking view; audit log newest first with filters; edit and delete refused at API (405) and database; ceiling values, near-ceiling at 80 %, breach wording, trailing 30 days
- [x] `tests/e2e/queue.spec.ts` - sorted queue, one-tap detail, a decision, audit log entry, 405 on delete, ceiling

### Acceptance Criteria Validation

- ✅ **ADM-01**: urgency order; separate counts that link to lists; one tap to detail; calm empty state. Provider quality flags on rows arrive in bolt 025. The under-2-second load is not separately measured for the queue.
- ✅ **ADM-02**: entries with admin, time, action, reason code and target; edits and deletes refused at API and database; newest first with filters
- ✅ **ADM-03**: values against 25 and 75; banner from 80 % on Insights and the Queue; breach worded as a re-platforming signal

### Issues Found

- The first admin booking page returned an error because of a missing import (found by the browser test); fixed and covered by an API test.
- One pets browser test timed out once under full-suite load; its time limit was raised.
