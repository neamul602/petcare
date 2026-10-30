---
stage: plan
bolt: 023-acute-event-response
created: 2026-11-01T22:00:00Z
---

## Implementation Plan: runbook and post-mortem (bolt 023)

Stories: ACU-03 runbook coordination, ACU-04 close with a post-mortem. Simplest workable version.

- **Runbook** on the admin's event page: seven steps (confirm trigger, provider role, admin role, vet lookup, owner notification, payout, post-mortem), each pending, done or skipped (a skip needs a note); every change is in the timeline. The owner-notification step sends the Bangla or English template as an in-app message on the owner's booking page and records the time (SMS delivery stays deferred). Templates can be edited; the edit applies to future events and is audit-logged.
- **Timers**: elapsed time since the trigger and time to the first admin entry are returned with the event.
- **Close**: the admin marks the event resolved, then a post-mortem (timeline accuracy, roles, owner communication, directory use, gaps, lessons) is required. A resolved event with no post-mortem after 48 hours is flagged as a reminder in the event list. Past post-mortems are listed (admin only).
