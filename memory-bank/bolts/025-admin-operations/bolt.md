---
id: 025-admin-operations
unit: 011-admin-operations
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: UJ-3
stories:
  - 004-provider-health-and-utilization
  - 005-defection-signals
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [004-accounts-notifications, 006-provider-supply-vetting, 022-reviews-disputes, 024-admin-operations]
enables_bolts: []
requires_units: [accounts-notifications, provider-supply-vetting, reviews-disputes]
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 025-admin-operations

## Overview

Plan phase **UJ-3**, bolt 25 of 25. Journeys served: UJ-2, UJ-3, UJ-4.

## Objective

Provider health and utilization flags with re-engagement notes, and user-surfaced defection signals.

## Stories Included

- **004-provider-health-and-utilization** (ADM-04): Provider health and utilization (Should) · [story](../../intents/001-petcare-v1/units/011-admin-operations/stories/004-provider-health-and-utilization.md)
- **005-defection-signals** (ADM-05): Defection signals (Should) · [story](../../intents/001-petcare-v1/units/011-admin-operations/stories/005-defection-signals.md)

## Expected Outcome

Low-utilization providers are flagged at days 30, 60 and 90; defection signals show on the provider list; nothing auto-suspends.

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
- 006-provider-supply-vetting
- 022-reviews-disputes
- 024-admin-operations

### Enables
- None

## Test Expectations

Clock-based API tests.

Workbook evidence produced: Step 30.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
