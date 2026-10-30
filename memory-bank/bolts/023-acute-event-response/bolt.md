---
id: 023-acute-event-response
unit: 010-acute-event-response
intent: 001-petcare-v1
type: ddd-construction-bolt
status: complete
phase: UJ-3
stories:
  - 003-runbook-coordination
  - 004-close-with-a-post-mortem
created: '2026-10-29T17:00:00Z'
started: '2026-11-01T22:00:00Z'
completed: '2026-10-30T15:48:07Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-11-01T22:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 004-accounts-notifications
  - 015-acute-event-response
enables_bolts: []
requires_units:
  - accounts-notifications
blocks: true
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 023-acute-event-response

## Overview

Plan phase **UJ-3**, bolt 23 of 25. Journeys served: UJ-3.

## Objective

Admin runbook coordination and the post-mortem close.

## Stories Included

- **003-runbook-coordination** (ACU-03): Runbook coordination (Must) · [story](../../intents/001-petcare-v1/units/010-acute-event-response/stories/003-runbook-coordination.md)
- **004-close-with-a-post-mortem** (ACU-04): Close with a post-mortem (Must) · [story](../../intents/001-petcare-v1/units/010-acute-event-response/stories/004-close-with-a-post-mortem.md)

## Expected Outcome

Ayaat runs the runbook, notifies Bibi from the template and closes with a post-mortem.

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
- 015-acute-event-response

### Enables
- None

## Test Expectations

Playwright runbook; API test for the post-mortem rule.

Workbook evidence produced: Step 31.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
