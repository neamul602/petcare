---
stage: implement
bolt: 006-provider-supply-vetting
created: 2026-10-30T16:20:00Z
---

## Implementation Walkthrough: provider supply (bolt 006)

### Summary

Providers now exist as records with a tier and a status only the admin can change. Owners see approved providers on a public page; nobody else is ever shown.

### Completed Work

- [x] `packages/shared/src/providers.ts` - tiers, status lifecycle (applied, vetting, approved, suspended, removed), capability flags
- [x] `apps/api/src/db/schema/providers.ts`, `drizzle/0005_providers.sql`
- [x] `apps/api/src/providers/{provider-records,routes}.ts` - lifecycle rules, tier change, audit entries, public and admin endpoints
- [x] `apps/api/src/seed/load-providers.ts` - training providers and the pending application; seed summary now reports `providers`
- [x] Web: `pages/providers/[slug].astro`, `pages/admin/providers/{index,[id]}.astro`, `act.ts`
- [x] 20 new strings (owner, English and Bangla) and admin English strings; 228 keys, parity passes

### Key Decisions

- Approving from vetting needs a price and capacity (profile completeness, FR-5); the editor to set them arrives in bolt 021, so seed providers are loaded complete.
- A suspended provider can be reinstated or removed; removed is final.
- The public page returns 404 for any provider that is not approved, so a suspension also hides the page.
- Photos and reviews areas show honest empty states ("New to PetCare. Building a track record.").

### Deviations from Plan

- Placeholder `/providers/sample-provider` and `/admin/providers/sample-provider` removed from the route list.

### Developer Notes

- Later bolts call `isProviderBookable(db, id)` before any request or confirmation.
