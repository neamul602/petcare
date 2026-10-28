---
id: 003-platform-foundation
unit: 001-platform-foundation
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: Thin slice
stories:
  - 004-pwa-offline-and-shared-states
  - 006-performance-and-accessibility-checks
  - 007-training-scenario-seed
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [001-platform-foundation]
enables_bolts: [011-booking-stay, 016-accounts-notifications]
requires_units: []
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 003-platform-foundation

## Overview

Plan phase **Thin slice**, bolt 3 of 25. Journeys served: foundation for all.

## Objective

PWA shell, shared loading/empty/error/offline states, performance and accessibility checks, and the labelled training seed.

## Stories Included

- **004-pwa-offline-and-shared-states** (FND-04): PWA, offline and shared states (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/004-pwa-offline-and-shared-states.md)
- **006-performance-and-accessibility-checks** (FND-06): Performance and accessibility checks (Should) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/006-performance-and-accessibility-checks.md)
- **007-training-scenario-seed** (FND-07): Training scenario seed (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/007-training-scenario-seed.md)

## Expected Outcome

App installs; offline banner and cached screens work; seed command loads the Dhaka training scenario with no fabricated reviews.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 001-platform-foundation

### Enables
- 011-booking-stay
- 016-accounts-notifications

## Test Expectations

Lighthouse and bundle budget in CI; axe checks; seed integration test.

Workbook evidence produced: Steps 17, 32.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
