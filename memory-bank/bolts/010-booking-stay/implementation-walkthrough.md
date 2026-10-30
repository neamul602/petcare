---
stage: implement
bolt: 010-booking-stay
created: 2026-10-31T10:00:00Z
---

## Implementation Walkthrough: provider decision (bolt 010)

### Summary

Providers now see what needs them (Today), all their bookings (Bookings) and a full request view, and can confirm with one tap or decline with one of six reasons. A request nobody answers within the window is closed and the owner's hold released.

### Completed Work

- [x] `apps/api/src/bookings/lock.ts` - one operation at a time per booking, shared by submit, cancel, confirm, decline and timeout
- [x] `apps/api/src/bookings/provider-service.ts` - `confirm`, `decline`, `processTimeouts`
- [x] `apps/api/src/bookings/provider-routes.ts` - `GET /provider/today`, `GET /provider/bookings`, `GET /provider/bookings/:id`, `POST .../confirm`, `POST .../decline`
- [x] `apps/api/src/bookings/pet-access.ts` - a provider can open a pet's care summary when the pet has a request with them
- [x] `apps/api/src/app.ts`, `server.ts` - wiring; a one-minute timer runs the timeout
- [x] Web: provider Today, Bookings list, request view with Confirm (primary) and a Decline sheet with the six reasons and no free text, owner page shows decline reason in plain words and the timed-out message
- [x] 38 new strings (378 keys, parity passes)

### Key Decisions

- See the plan: lock plus state-checked update means the first action wins; capture happens before the state change; a failed capture keeps the request waiting with a retry.

### Deviations from Plan

- Owner notifications for confirm, decline and timeout are deferred with the notification system (see `deferred-scope.md`); the owner sees the result on the booking page.
- Placeholder `/provider/bookings/sample-booking` removed from the route list.
