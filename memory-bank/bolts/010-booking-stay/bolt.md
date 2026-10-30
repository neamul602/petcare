---
id: 010-booking-stay
unit: 008-booking-stay
intent: 001-petcare-v1
type: ddd-construction-bolt
status: complete
phase: Thin slice
stories:
  - 005-provider-today-and-bookings
  - 006-provider-request-view
  - 007-confirm-a-request
  - 008-decline-with-a-reason
  - 009-confirmation-window-timeout
created: '2026-10-29T17:00:00Z'
started: '2026-10-31T09:00:00Z'
completed: '2026-10-30T12:50:59Z'
current_stage: null
stages_completed:
  - name: model
    completed: '2026-10-31T09:00:00Z'
    artifact: implementation-plan.md
  - name: design
    completed: '2026-10-31T09:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 004-accounts-notifications
  - 005-pet-care-profile
  - 008-payments-payouts
  - 009-booking-stay
enables_bolts:
  - 011-booking-stay
requires_units:
  - accounts-notifications
  - payments-payouts
  - pet-care-profile
blocks: true
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 010-booking-stay

## Overview

Plan phase **Thin slice**, bolt 10 of 25. Journeys served: UJ-1, UJ-2, UJ-4.

## Objective

Provider Today and Bookings, request view with care history, confirm, decline with a reason, and the confirmation-window timeout.

## Stories Included

- **005-provider-today-and-bookings** (BKG-05): Provider Today and Bookings (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/005-provider-today-and-bookings.md)
- **006-provider-request-view** (BKG-06): Provider request view (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/006-provider-request-view.md)
- **007-confirm-a-request** (BKG-07): Confirm a request (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/007-confirm-a-request.md)
- **008-decline-with-a-reason** (BKG-08): Decline with a reason (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/008-decline-with-a-reason.md)
- **009-confirmation-window-timeout** (BKG-09): Confirmation-window timeout (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/009-confirmation-window-timeout.md)

## Expected Outcome

Thin slice complete: Rashid sees Tito's request and confirms in two taps, capturing payment; declines release the hold with a reason; silence times out and releases.

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
- 004-accounts-notifications
- 005-pet-care-profile
- 008-payments-payouts
- 009-booking-stay

### Enables
- 011-booking-stay

## Test Expectations

Integration tests with the clock; Playwright provider flow; STEP-25 transaction record.

Workbook evidence produced: Steps 24, 25.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
