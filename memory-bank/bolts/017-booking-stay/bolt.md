---
id: 017-booking-stay
unit: 008-booking-stay
intent: 001-petcare-v1
type: simple-construction-bolt
status: complete
phase: UJ-4
stories:
  - 016-book-again
  - 017-owner-bookings-list
created: '2026-10-29T17:00:00Z'
started: '2026-11-01T09:00:00Z'
completed: '2026-10-30T13:57:47Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-11-01T09:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 005-pet-care-profile
  - 009-booking-stay
  - 013-booking-stay
enables_bolts: []
requires_units:
  - pet-care-profile
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 017-booking-stay

## Overview

Plan phase **UJ-4**, bolt 17 of 25. Journeys served: UJ-4.

> **Bolt type override:** the unit default differs; this bolt is UI and read-model work, so a simple-construction-bolt fits better.

## Objective

Book again (pre-filled flow with the timer) and the owner bookings list.

## Stories Included

- **016-book-again** (BKG-16): Book again (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/016-book-again.md)
- **017-owner-bookings-list** (BKG-17): Owner bookings list (Should) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/017-owner-bookings-list.md)

## Expected Outcome

Bibi books Tito with Rashid again from Home or Bookings and submits in under 4 minutes; the server records the timing.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 005-pet-care-profile
- 009-booking-stay
- 013-booking-stay

### Enables
- None

## Test Expectations

Playwright timing test (STEP-28).

Workbook evidence produced: Step 28.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
