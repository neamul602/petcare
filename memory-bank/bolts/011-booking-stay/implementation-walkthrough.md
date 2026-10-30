---
stage: implement
bolt: 011-booking-stay
created: 2026-10-31T12:30:00Z
---

## Implementation Walkthrough: the stay (bolt 011)

### Summary

A confirmed stay can be started on its start date, the provider posts daily updates with photos, a care log and a note, both sides see the updates and the neighbourhood's vet clinics, and the admin gets a flag when a stay is not started by 12:00 on its start date.

### Completed Work

- [x] `apps/api/src/db/schema/stay.ts`, `drizzle/0009_stay.sql` - updates and photos, with a database trigger that refuses edits and deletes
- [x] `apps/api/src/stay/{stay-service,routes}.ts` - start stay, late-start flag, post update (one multipart request, up to 4 photos), list updates, serve photos to the booking's two people only, reminder state, vet clinics
- [x] `apps/api/src/app.ts`, `server.ts` - wiring; the one-minute timer also flags late starts
- [x] Provider and owner views carry `updates`, `canStart` and `reminderDue`; Today shows stays arriving today
- [x] Web: `components/stay/{UpdateForm,UpdateList,VetClinics}`, Start stay and Post update on the provider booking page, updates and vet clinics on the owner page
- [x] 42 new strings (420 keys, parity passes)

### Key Decisions

- See the plan. The 18:00 reminder is a banner on Today and the booking page instead of a notification; the late-start flag is an audit entry the admin queue will show.
- Chat (BKG-13) is not built (deferred).
- The offline hold for an update keeps the draft on the open page; photos are not stored across a reload.

### Deviations from Plan

- Offline directory from cache (BKG-14 edge case) relies on the existing service-worker page caching and is not separately tested.
