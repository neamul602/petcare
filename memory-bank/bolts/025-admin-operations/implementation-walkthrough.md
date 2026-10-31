---
stage: implement
bolt: 025-admin-operations
created: 2026-11-02T15:00:00Z
---

## Implementation Walkthrough: provider health and defection signals (bolt 025)

### Summary

The admin sees quality flags on every provider (low utilization at day 30, 60 and 90, low confirmation, defection signal), can recompute them with Evaluate now, record outreach and its outcome, and tag defection signals with their source. Nothing suspends automatically.

### Completed Work

- [x] `apps/api/src/db/schema/providers.ts`, `drizzle/0019_health.sql` - provider outreach and defection signals
- [x] `apps/api/src/admin/health.ts` - flags from the utilization checkpoints and recent confirmation record, Evaluate now, outreach, signals, context metrics note
- [x] Queue rows for a provider's bookings carry that provider's flags
- [x] Bookings now take their creation time from the clock (the health flags need it)
- [x] Web: flags and a signal marker on the provider list, Evaluate now, health and outreach and signals on the provider page
- [x] 25 new admin strings (parity passes)

### Key Decisions

- Simplest workable version (see the plan). Utilization is booked nights over capacity nights for the trailing 30 days; the checkpoint used is the latest one the provider has reached (TD-10).
