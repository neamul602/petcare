---
id: 013-booking-stay
unit: 008-booking-stay
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 015-mark-complete-and-confirm-completion
  - 011-cancellations-and-no-shows
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [011-booking-stay, 012-payments-payouts]
enables_bolts: [014-reviews-disputes, 017-booking-stay]
requires_units: [payments-payouts]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 3
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 013-booking-stay

## Overview

Plan phase **UJ-1 complete**, bolt 13 of 25. Journeys served: UJ-1.

## Objective

Completion (provider marks, owner confirms) and the cancellation and no-show paths from TD-6 and the Step 24 decision.

## Stories Included

- **015-mark-complete-and-confirm-completion** (BKG-15): Mark complete and confirm completion (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/015-mark-complete-and-confirm-completion.md)
- **011-cancellations-and-no-shows** (BKG-11): Cancellations and no-shows (Should) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/011-cancellations-and-no-shows.md)

## Expected Outcome

Rashid completes the stay, Bibi confirms, the payout is queued; cancellations and no-shows follow the approved rules.

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
- 011-booking-stay
- 012-payments-payouts

### Enables
- 014-reviews-disputes
- 017-booking-stay

## Test Expectations

Lifecycle tests per transition (STEP-24); Playwright completion.

Workbook evidence produced: Steps 24, 27.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
