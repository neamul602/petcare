---
stage: plan
bolt: 025-admin-operations
created: 2026-11-02T13:00:00Z
---

## Implementation Plan: provider health and defection signals (bolt 025)

Stories: ADM-04 provider health and utilization, ADM-05 defection signals. Simplest workable version.

- **Provider flags** (admin provider list and queue rows): for each approved provider, utilization = booked nights / capacity nights over the trailing 30 days (capacity from the calendar rows or the usual room). A flag shows when utilization is below 40 % at 30 days after approval, 30 % at 60 days, or 20 % at 90 days (TD-10), plus a low confirmation flag when the provider let requests time out or declined most requests recently. "Evaluate now" recomputes flags and returns them (for demos). Nothing suspends automatically.
- **Outreach record**: for a flagged provider the admin records the outreach and its outcome; saved and audit-logged.
- **Defection signals**: the admin tags a report, review or other feedback that mentions off-platform contact as a defection signal against a provider, with its source; signals show as a marker on the provider list and are listed on the provider page. Nothing suspends automatically. Counter-metrics are only ever shown without targets.
