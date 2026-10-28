---
id: 008-payments-payouts
unit: 007-payments-payouts
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-authorize-payment-at-request
  - 002-capture-on-confirmation
  - 003-release-authorization
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [001-platform-foundation, 002-dummy-integration-services]
enables_bolts: [009-booking-stay, 010-booking-stay, 012-payments-payouts]
requires_units: [dummy-integration-services, platform-foundation]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 008-payments-payouts

## Overview

Plan phase **Thin slice**, bolt 8 of 25. Journeys served: UJ-1, UJ-4.

## Objective

Payment port and the authorize, capture-on-confirmation and release rules with idempotency and a payment event log.

## Stories Included

- **001-authorize-payment-at-request** (PAY-01): Authorize payment at request (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/001-authorize-payment-at-request.md)
- **002-capture-on-confirmation** (PAY-02): Capture on confirmation (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/002-capture-on-confirmation.md)
- **003-release-authorization** (PAY-03): Release authorization (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/003-release-authorization.md)

## Expected Outcome

BDT 20,000 authorized with bKash and nothing captured; capture happens once even on retry; release on decline, timeout or cancel.

## Bolt Type

**Type**: ddd-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md
- [ ] **3. ADR Analysis (optional)**: Pending → adr-*.md
- [ ] **4. Implement**: Pending → source code
- [ ] **5. Test**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 001-platform-foundation
- 002-dummy-integration-services

### Enables
- 009-booking-stay
- 010-booking-stay
- 012-payments-payouts

## Test Expectations

Integration tests against the Dummy gateway incl. down, decline and ambiguous modes.

Workbook evidence produced: Steps 23, 25.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
