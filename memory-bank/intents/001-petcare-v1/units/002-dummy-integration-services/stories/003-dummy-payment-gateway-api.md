---
id: 003-dummy-payment-gateway-api
code: DUM-03
unit: 002-dummy-integration-services
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1, UJ-4
created: 2026-10-29T16:00:00Z
assigned_bolt: 002-dummy-integration-services
implemented: false
---

# Story DUM-03: Dummy payment gateway API

## User Story

**As a** tester
**I want** a training payment gateway with authorize, capture, release, refund and get
**So that** the money flow can be tested end to end, including failures

## Acceptance Criteria

- [ ] **Given** POST /api/payments/authorizations with method bkash, nagad or card and an amount, **When** called, **Then** an authorization with status authorized is returned
- [ ] **Given** .../:id/capture called twice with the same idempotency key, **When** processed, **Then** only one capture exists and both calls return the same result
- [ ] **Given** .../:id/release, **When** called on an authorized hold, **Then** status becomes released and capture is no longer possible
- [ ] **Given** POST /api/payments/:paymentId/refunds with an amount up to the captured amount, **When** called, **Then** a refund is recorded
- [ ] **Given** failure modes down, timeout, decline and ambiguous, **When** set, **Then** authorize and capture behave accordingly

## Traceability

- **Requirements:** TR-1, DR-13, NFR-9
- **Journeys:** UJ-1, UJ-4

## UI/UX Impact

None

## API Dependencies (including Dummy APIs)

POST /api/payments/authorizations, .../capture, .../release, /refunds, GET /api/payments/:paymentId

## Test Expectations

API tests incl. double capture (STEP-18)

## Dependencies

### Requires
- DUM-01 Dummy service host and training controls (`002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md`)

### Enables
- PAY-01 Authorize payment at request (`007-payments-payouts/stories/001-authorize-payment-at-request.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Refund above captured amount | Rejected |
| Capture after release | Rejected |

## Out of Scope

- Real bKash/Nagad/SSLCommerz behaviour
