---
id: 009-booking-stay
unit: 008-booking-stay
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-booking-state-machine
  - 002-book-pet-dates-and-care-plan
  - 003-review-and-submit-with-payment
  - 004-owner-booking-page-waiting
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [001-platform-foundation, 005-pet-care-profile, 007-search-capacity, 008-payments-payouts]
enables_bolts: [010-booking-stay, 017-booking-stay, 024-admin-operations]
requires_units: [payments-payouts, pet-care-profile, platform-foundation, search-capacity]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 009-booking-stay

## Overview

Plan phase **Thin slice**, bolt 9 of 25. Journeys served: UJ-1, UJ-4.

## Objective

Booking state machine, the Book flow (pet and dates, care plan, review and pay) and the owner's waiting page.

## Stories Included

- **001-booking-state-machine** (BKG-01): Booking state machine (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/001-booking-state-machine.md)
- **002-book-pet-dates-and-care-plan** (BKG-02): Book: pet, dates and care plan (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/002-book-pet-dates-and-care-plan.md)
- **003-review-and-submit-with-payment** (BKG-03): Review and submit with payment (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/003-review-and-submit-with-payment.md)
- **004-owner-booking-page-waiting** (BKG-04): Owner booking page: waiting (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/004-owner-booking-page-waiting.md)

## Expected Outcome

Bibi submits a request for Tito with Rashid; the booking is authorized and waiting with a visible deadline; she can cancel before confirmation.

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
- 005-pet-care-profile
- 007-search-capacity
- 008-payments-payouts

### Enables
- 010-booking-stay
- 017-booking-stay
- 024-admin-operations

## Test Expectations

Lifecycle unit tests; API tests; Playwright booking submission.

Workbook evidence produced: Steps 23, 24.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
