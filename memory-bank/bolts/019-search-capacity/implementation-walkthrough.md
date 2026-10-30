---
stage: implement
bolt: 019-search-capacity
created: 2026-11-01T14:00:00Z
---

## Implementation Walkthrough: peak windows and neighbourhood counts (bolt 019)

### Summary

The admin defines peak windows (for example Eid). A stay overlapping one has a 12-hour confirmation window and an 8 % Tier-A commission; the provider's calendar marks peak nights and offers Expand for peak; the admin's Insights page shows completed bookings per neighbourhood per month.

### Completed Work

- [x] `apps/api/src/db/schema/capacity.ts`, `drizzle/0015_peak.sql` - peak windows
- [x] `apps/api/src/capacity/peak.ts` - `isPeakStay`, `GET /peak-windows`, `POST /admin/peak-windows`, `POST /provider/capacity/expand-peak`; the calendar marks peak nights
- [x] The two earlier stubs now use `isPeakStay`: confirmation deadline in `booking-service.ts`, commission in `provider-service.ts`
- [x] `apps/api/src/bookings/insights.ts` - `GET /admin/insights/neighbourhoods`
- [x] Web: peak prompt, Tier-A commission note and peak marks on the provider calendar; Insights page with the table and a peak-window form
- [x] 17 new strings (509 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). Peak windows are inclusive date ranges; a stay is peak if any night falls inside.
