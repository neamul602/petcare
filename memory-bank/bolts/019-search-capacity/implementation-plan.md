---
stage: plan
bolt: 019-search-capacity
created: 2026-11-01T13:00:00Z
---

## Implementation Plan: peak windows and bookings per neighbourhood (bolt 019)

Stories: SRC-02 peak window capacity, SRC-06 bookings per neighbourhood. Simplest workable version.

- **Peak windows** are named date ranges (for example Eid) the admin creates and everyone can read. A stay that overlaps a peak window is a peak stay: its confirmation window is 12 hours instead of 24 (TD-1) and a Tier-A provider's commission is 8 % instead of 10 % (TD-8). Both were stubbed earlier and now use the real check.
- **Expand for peak**: on the provider's calendar a peak prompt explains the peak rules (and the Tier-A commission) and sets all nights of the window to a chosen capacity in one action; full nights open again; raising is always allowed; lowering below confirmed bookings is refused as before. Peak nights carry a peak mark.
- **Bookings per neighbourhood**: the admin's Insights page shows completed bookings per launch neighbourhood per month. Expansion stays an admin decision; nothing auto-expands.
