---
id: 001-authorize-payment-at-request
code: PAY-01
unit: 007-payments-payouts
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1, UJ-4
created: 2026-10-29T16:00:00Z
assigned_bolt: 008-payments-payouts
implemented: false
---

# Story PAY-01: Authorize payment at request

## User Story

**As a** owner
**I want** to authorize payment with bKash, Nagad or card when I submit a request
**So that** the provider sees a serious request and I am not charged yet

## Acceptance Criteria

- [ ] **Given** a request, **When** I choose bKash or Nagad (shown first) or card, **Then** an authorization for the total is placed through the payment port and nothing is captured
- [ ] **Given** UJ-1, **When** Bibi books Rashid for 8 nights at BDT 2,500, **Then** BDT 20,000 is authorized
- [ ] **Given** the gateway is down or times out, **When** I submit, **Then** no booking is created and I can retry
- [ ] **Given** a decline, **When** returned, **Then** I see a clear message and the request is not submitted
- [ ] **Given** every authorization attempt, **When** made, **Then** a payment event is logged with time, gateway reference and booking reference

## Traceability

- **Requirements:** FR-15, FR-39, FR-40, DR-9, DR-21, NFR-9, NFR-23; TD-7
- **Journeys:** UJ-1, UJ-4

## UI/UX Impact

O5 Book (Review & pay); mockup 17-booking-submission-payment

## API Dependencies (including Dummy APIs)

payment port -> Dummy Payment Gateway

## Test Expectations

Integration tests with failure modes (STEP-23, STEP-35)

## Dependencies

### Requires
- DUM-03 Dummy payment gateway API (`002-dummy-integration-services/stories/003-dummy-payment-gateway-api.md`)
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)

### Enables
- PAY-02 Capture on confirmation (`007-payments-payouts/stories/002-capture-on-confirmation.md`)
- PAY-03 Release authorization (`007-payments-payouts/stories/003-release-authorization.md`)
- BKG-03 Review and submit with payment (`008-booking-stay/stories/003-review-and-submit-with-payment.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Ambiguous result | Reconciled before a booking is created; never two holds |

## Out of Scope

- Split payment
