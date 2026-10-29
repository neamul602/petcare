---
stage: implement
bolt: 005-pet-care-profile
created: 2026-10-30T15:30:00Z
---

## Implementation Walkthrough: pet-care-profile (bolt 005)

### Summary

Owners can add, edit and archive dog and cat profiles with a structured care plan and photos. Clinical requests are refused at intake, care history and pre-fill are served by the API, and providers get a care summary only when a booking policy allows it (deny-all until the booking bolts).

### Structure Overview

- Shared rules in `packages/shared/src/pets.ts` (Zod schemas used by the API and the form).
- API module `apps/api/src/pets/`: routes, photo port with a Dummy adapter, clinical-request screen, care history, provider care summary.
- Web: pet list, add, profile with care-history tab, edit, archive; one Preact form island.

### Completed Work

- [x] `packages/shared/src/pets.ts` - species, enums, care plan, medication, behaviour, dog and cat details
- [x] `apps/api/src/db/schema/pets.ts`, `drizzle/0004_pets.sql` - pets, photos, care history
- [x] `apps/api/src/pets/{photo-port,dummy-photos,clinical-screen,care-history,care-summary,routes}.ts`
- [x] `apps/api/src/app.ts`, `server.ts` - multipart uploads (5 MB), dependency wiring, 413 mapping
- [x] `apps/api/src/seed/load-pets.ts` - Tito with insulin twice a day, loaded from seed data
- [x] `apps/web/src/components/pets/PetForm.tsx` - sections, species-specific fields, medicine repeater, photo upload with progress and retry, inline errors, drafts kept on the device
- [x] `apps/web/src/pages/pets/{index,new}.astro`, `[id]/{index,edit}.astro`, `[id]/archive.ts`, `lib/pets.ts`
- [x] `apps/web/src/pages/api/[...path].ts` - forwards binary bodies
- [x] 120 new English and Bangla strings (208 keys, parity passes)

### Key Decisions

- **Clinical screening**: owner must tick "not clinical" when text looks like a clinical request; declared clinical requests are refused with a reason (TD-12 scope).
- **Provider summary** excludes owner contact and is deny-all by default; the booking bolts supply the policy.
- **Photos**: stored through the Dummy photo service via a port; a failure never loses the pet, the photo can be retried.
- **Edit and create share one form**; on create, photos upload after the pet exists.

### Deviations from Plan

- Placeholder `/pets/sample-pet*` routes removed from the route list; real pages are tested instead.

### Dependencies Added

- `@fastify/multipart`

### Developer Notes

- Care history is written by the booking bolts through `recordCareHistory`; until then the tab shows the "first stay" message.
- Archive keeps history (PET-07 retention rules arrive in bolt 018).
