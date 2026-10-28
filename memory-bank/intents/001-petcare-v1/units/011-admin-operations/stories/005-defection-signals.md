---
id: 005-defection-signals
code: ADM-05
unit: 011-admin-operations
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-4, UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 025-admin-operations
implemented: false
---

# Story ADM-05: Defection signals

## User Story

**As a** admin
**I want** to see off-platform defection signals that owners or providers report
**So that** I can protect the platform without spying

## Acceptance Criteria

- [ ] **Given** a report, review or feedback that mentions off-platform contact, **When** I tag it as a defection signal, **Then** it is stored against the provider with its source
- [ ] **Given** the provider list, **When** signals exist, **Then** a signal marker shows; the provider page lists them
- [ ] **Given** signals, **When** present, **Then** nothing is suspended automatically
- [ ] **Given** counter-metrics (GMV, active users, earnings), **When** shown, **Then** they are never presented as targets

## Traceability

- **Requirements:** FR-50, FR-36; UC-4; page specs 4.10 and 5.8 merged
- **Journeys:** UJ-4, UJ-3

## UI/UX Impact

A4 Providers

## API Dependencies (including Dummy APIs)

Insights API

## Test Expectations

API test

## Dependencies

### Requires
- ADM-04 Provider health and utilization (`011-admin-operations/stories/004-provider-health-and-utilization.md`)
- REV-06 Investigate and resolve a report (`009-reviews-disputes/stories/006-investigate-and-resolve-a-report.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Scanning WhatsApp or Messenger
- Behavioural analytics
