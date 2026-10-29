---
stage: plan
bolt: 006-provider-supply-vetting
created: 2026-10-30T16:00:00Z
---

## Implementation Plan: provider supply, thin slice (bolt 006)

Stories: SUP-01 (records, tiers, status), SUP-04 (public provider page). Approved under the owner's standing instruction.

- Shared rules `packages/shared/src/providers.ts` (tiers, lifecycle, capability flags).
- Tables `providers` and `provider_status_events` (migration 0005); the seed loads the four approved providers and Sadia's pending application.
- API: `GET /providers/:slug` (approved only, no private fields), admin list, detail, create, status and tier changes (reason required, audit-logged). `isProviderBookable` is the one check later bolts use.
- Web: public provider page with Tier-A badge, admin provider list and detail with forms (no scripts needed).
- Deferred to bolt 021: provider profile editor, verification artifacts, application review criteria, appeal and bias data (SUP-02, SUP-03, SUP-05).
- Tests: API integration tests, Playwright for the page and the admin flow.
