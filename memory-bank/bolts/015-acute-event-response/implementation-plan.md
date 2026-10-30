---
stage: plan
bolt: 015-acute-event-response
created: 2026-10-31T21:00:00Z
---

## Implementation Plan: report a concern and its effects (bolt 015)

Stories: ACU-01 report a concern, ACU-02 effects and owner notice. The runbook and post-mortem (ACU-03, ACU-04) are bolt 023. Kept simple.

### Simplest workable design

- **Provider** taps Report a concern on an in-stay booking: type (illness, injury, death), severity (minor, serious, critical) and what they observed. The vet clinics for the neighbourhood are on the same page with tap-to-call. Not available outside an in-stay booking.
- **Effects, in one step**: the event is stored with its trigger time; the payout is frozen; the owner may report a problem right away (the dispute window opens early); the provider is flagged in the audit log (no automatic suspension); an admin queue item is raised (acute events sort to the top of the list); the owner sees a calm banner on the booking page.
- **Owner notice**: the in-app banner is the notice. Sending an SMS-style notification is part of the deferred notification system, so the notified time recorded is when the banner became available (same moment as the trigger). Both times are stored and returned so the demo can show the gap.
- Admin list `GET /admin/acute-events` returns open events first with both times.
