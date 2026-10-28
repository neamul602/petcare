---
id: 008-admin-payouts-and-reconciliation
code: PAY-08
unit: 007-payments-payouts
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 020-payments-payouts
implemented: false
---

# Story PAY-08: Admin payouts and reconciliation

## User Story

**As a** admin
**I want** to see batches, frozen payouts and whether totals match the payout rail
**So that** money never drifts unnoticed

## Acceptance Criteria

- [ ] **Given** A6 Payouts, **When** opened, **Then** batches, lines and frozen payouts are listed
- [ ] **Given** reconciliation, **When** totals differ from the Dummy payout inspection, **Then** the mismatch is highlighted

## Traceability

- **Requirements:** DR-17; page spec 4.8
- **Journeys:** UJ-3

## UI/UX Impact

A6 Payouts

## API Dependencies (including Dummy APIs)

Payouts API

## Test Expectations

Integration test with a forced mismatch

## Dependencies

### Requires
- PAY-05 Weekly payout batch (`007-payments-payouts/stories/005-weekly-payout-batch.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- CSV export
