---
id: 004-provider-health-and-utilization
code: ADM-04
unit: 011-admin-operations
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-2, UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 025-admin-operations
implemented: false
---

# Story ADM-04: Provider health and utilization

## User Story

**As a** admin
**I want** flags on the provider list for low confirmation, low utilization and other quality signals
**So that** I can act before a provider leaves or slips

## Acceptance Criteria

- [ ] **Given** providers, **When** I open Providers, **Then** each row shows tier, status and flags
- [ ] **Given** utilization (booked nights / capacity nights, trailing 30 days), **When** below 40 % at day 30, 30 % at day 60 or 20 % at day 90, **Then** the matching flag shows
- [ ] **Given** Evaluate now, **When** tapped, **Then** flags are recomputed (for demos)
- [ ] **Given** a flag, **When** I record outreach and outcome, **Then** it is saved and audit-logged; nothing auto-suspends

## Traceability

- **Requirements:** FR-36; TD-10; page spec 4.4
- **Journeys:** UJ-2, UJ-3

## UI/UX Impact

A4 Providers (list)

## API Dependencies (including Dummy APIs)

Insights API; Providers API

## Test Expectations

Clock-based API test

## Dependencies

### Requires
- SUP-01 Provider records, tiers and status (`005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- ADM-05 Defection signals (`011-admin-operations/stories/005-defection-signals.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Bulk campaigns
