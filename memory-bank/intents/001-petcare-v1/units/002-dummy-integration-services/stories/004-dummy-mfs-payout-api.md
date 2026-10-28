---
id: 004-dummy-mfs-payout-api
code: DUM-04
unit: 002-dummy-integration-services
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 002-dummy-integration-services
implemented: false
---

# Story DUM-04: Dummy MFS payout API

## User Story

**As a** tester
**I want** a training payout rail with batches, freeze, release and status
**So that** provider payouts can be tested without real money

## Acceptance Criteria

- [ ] **Given** POST /api/payouts/batches with lines and an idempotency key, **When** sent twice, **Then** one batch exists
- [ ] **Given** .../:payoutId/freeze, **When** called, **Then** the payout is frozen until released
- [ ] **Given** .../:payoutId/release, **When** called, **Then** the payout continues to paid
- [ ] **Given** failure mode down, **When** a batch is sent, **Then** nothing is paid and the error is clear

## Traceability

- **Requirements:** TR-2, DR-14
- **Journeys:** UJ-2

## UI/UX Impact

None

## API Dependencies (including Dummy APIs)

POST /api/payouts/batches, .../freeze, .../release, GET /api/payouts/:payoutId

## Test Expectations

API tests incl. repeated batch

## Dependencies

### Requires
- DUM-01 Dummy service host and training controls (`002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md`)

### Enables
- PAY-05 Weekly payout batch (`007-payments-payouts/stories/005-weekly-payout-batch.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Release of a paid payout | Rejected |

## Out of Scope

- Real MFS settlement
