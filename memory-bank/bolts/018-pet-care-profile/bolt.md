---
id: 018-pet-care-profile
unit: 004-pet-care-profile
intent: 001-petcare-v1
type: simple-construction-bolt
status: complete
phase: UJ-4
stories:
  - 007-archive-and-retention
created: '2026-10-29T17:00:00Z'
started: '2026-11-01T11:00:00Z'
completed: '2026-10-30T14:02:26Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-11-01T11:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 004-accounts-notifications
  - 005-pet-care-profile
enables_bolts: []
requires_units:
  - accounts-notifications
blocks: true
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 018-pet-care-profile

## Overview

Plan phase **UJ-4**, bolt 18 of 25. Journeys served: foundation for all.

## Objective

Pet archiving and 24-month retention.

## Stories Included

- **007-archive-and-retention** (PET-07): Archive and retention (Should) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/007-archive-and-retention.md)

## Expected Outcome

Archived pets leave lists while their history remains; retention rules hold with the clock.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 004-accounts-notifications
- 005-pet-care-profile

### Enables
- None

## Test Expectations

API tests with the clock.

Workbook evidence produced: Step 28.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
