---
id: 019-search-capacity
unit: 006-search-capacity
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-2
stories:
  - 002-peak-window-capacity
  - 006-bookings-per-neighbourhood
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [007-search-capacity]
enables_bolts: []
requires_units: []
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 019-search-capacity

## Overview

Plan phase **UJ-2**, bolt 19 of 25. Journeys served: UJ-2, UJ-3.

## Objective

Peak-window capacity (Eid) with the Tier-A peak prompt, and bookings per neighbourhood.

## Stories Included

- **002-peak-window-capacity** (SRC-02): Peak-window capacity (Must) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/002-peak-window-capacity.md)
- **006-bookings-per-neighbourhood** (SRC-06): Bookings per neighbourhood (Should) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/006-bookings-per-neighbourhood.md)

## Expected Outcome

Rashid raises Eid capacity from 2 to 4 and blocked nights become available; admin sees bookings per neighbourhood.

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
- 007-search-capacity

### Enables
- None

## Test Expectations

Capacity tests (raise to 4); API tests.

Workbook evidence produced: Step 22.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
