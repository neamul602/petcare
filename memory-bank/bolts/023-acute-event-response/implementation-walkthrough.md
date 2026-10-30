---
stage: implement
bolt: 023-acute-event-response
created: 2026-11-02T09:00:00Z
---

## Implementation Walkthrough: runbook and post-mortem (bolt 023)

### Summary

The admin has an event page with a seven-step runbook, timers, the vet clinics, a Bangla or English message to the owner (shown on the owner's booking page), editable templates, and a required post-mortem to close the event. A reminder shows when a resolved event has no post-mortem after 48 hours.

### Completed Work

- [x] `apps/api/src/db/schema/acute.ts`, `drizzle/0018_runbook.sql` - steps (also the timeline), messages, templates, post-mortems, resolved time
- [x] `apps/api/src/acute/runbook.ts` - event detail with timers, step updates (a skip needs a note), owner message, templates, resolve, post-mortem, reminders, past post-mortems
- [x] Owner booking page shows the messages under the banner
- [x] Web: `/admin/acute` list with reminders, post-mortems and template editing; `/admin/acute/[id]` runbook page and its actions
- [x] 38 new admin strings (553 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). The owner message is an in-app message; SMS delivery remains deferred.
