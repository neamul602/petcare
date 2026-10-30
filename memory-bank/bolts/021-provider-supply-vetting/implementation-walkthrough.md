---
stage: implement
bolt: 021-provider-supply-vetting
created: 2026-11-01T18:30:00Z
---

## Implementation Walkthrough: vetting and the provider profile (bolt 021)

### Summary

Approval of a provider is now gated by vetting: identity, address and capability must be recorded as complete (and a personal outreach note for Tier-A). Requests for information, appeals and a decisions list support fair review, and providers edit their own public profile.

### Completed Work

- [x] `apps/api/src/db/schema/providers.ts`, `drizzle/0016_vetting.sql` - vetting records (private) and appeals
- [x] `apps/api/src/providers/vetting.ts` - record, request information, appeals and outcome, decisions list
- [x] `apps/api/src/providers/provider-records.ts` - approval from vetting is refused with the missing checks listed
- [x] `apps/api/src/providers/profile.ts` - `GET/PUT /provider/profile` with a completeness list; tier and status not editable
- [x] Web: vetting section, request information and appeals on the admin provider page; vetting decisions list on the admin provider list; provider profile page
- [x] 18 new strings (541 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). Document references are text entries kept only in the admin-only record. Capacity per size is not built.
