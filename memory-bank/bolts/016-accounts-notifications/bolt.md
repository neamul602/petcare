---
id: 016-accounts-notifications
unit: 003-accounts-notifications
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 004-inbox
  - 005-settings
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [003-platform-foundation, 004-accounts-notifications]
enables_bolts: []
requires_units: [platform-foundation]
blocks: true

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 016-accounts-notifications

## Overview

Plan phase **UJ-1 complete**, bolt 16 of 25. Journeys served: UJ-1.

## Objective

Inbox for each role and settings.

## Stories Included

- **004-inbox** (ACC-04): Inbox (Should) · [story](../../intents/001-petcare-v1/units/003-accounts-notifications/stories/004-inbox.md)
- **005-settings** (ACC-05): Settings (Should) · [story](../../intents/001-petcare-v1/units/003-accounts-notifications/stories/005-settings.md)

## Expected Outcome

Every notification from the journey appears in the inbox with a link; language and notification choices persist.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 003-platform-foundation
- 004-accounts-notifications

### Enables
- None

## Test Expectations

Playwright inbox and settings.

Workbook evidence produced: Step 32.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
