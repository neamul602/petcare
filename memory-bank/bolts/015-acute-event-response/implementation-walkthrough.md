---
stage: implement
bolt: 015-acute-event-response
created: 2026-10-31T22:00:00Z
---

## Implementation Walkthrough: report a concern (bolt 015)

### Summary

During a stay the provider can report an illness, injury or death with a severity and what they saw. In one step the payout is frozen, the owner's dispute window opens, the provider is flagged in the audit log (not suspended), an admin queue item is raised, and the owner sees a calm banner on the booking page.

### Completed Work

- [x] `apps/api/src/db/schema/acute.ts`, `drizzle/0013_acute.sql`
- [x] `apps/api/src/acute/{service,routes}.ts` - `POST /provider/bookings/:id/acute-event`, `GET /admin/acute-events` (open first, both times and the gap)
- [x] Owner may report a problem during the stay once an acute event exists (`reviews/service.ts`); owner and provider booking views carry the event
- [x] Web: Report a concern sheet next to the vet clinics on the provider's in-stay page; coral banner on the owner's page
- [x] 14 new strings (482 keys, parity passes)

### Key Decisions

- The in-app banner is the owner notice; an SMS-style notification is part of the deferred notification system (see `deferred-scope.md`). The owner-notified time is stored and equals the trigger time because the banner is available immediately.
- Runbook and post-mortem (ACU-03, ACU-04) are bolt 023.
