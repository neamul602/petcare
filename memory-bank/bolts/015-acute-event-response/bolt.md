---
id: 015-acute-event-response
unit: 010-acute-event-response
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 001-report-a-concern
  - 002-acute-event-effects-and-owner-notice
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [004-accounts-notifications, 011-booking-stay, 012-payments-payouts]
enables_bolts: [023-acute-event-response]
requires_units: [accounts-notifications, booking-stay, payments-payouts]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 015-acute-event-response

## Overview

Plan phase **UJ-1 complete**, bolt 15 of 25. Journeys served: UJ-1, UJ-3.

## Objective

Provider 'Report a concern' with vet clinics, and its effects: payout freeze, early dispute window, provider flag, owner banner and notice, measured times.

## Stories Included

- **001-report-a-concern** (ACU-01): Report a concern (Must) · [story](../../intents/001-petcare-v1/units/010-acute-event-response/stories/001-report-a-concern.md)
- **002-acute-event-effects-and-owner-notice** (ACU-02): Acute-event effects and owner notice (Must) · [story](../../intents/001-petcare-v1/units/010-acute-event-response/stories/002-acute-event-effects-and-owner-notice.md)

## Expected Outcome

Rashid reports Tito's concern; the admin queue shows it first; Bibi is notified in under 5 minutes; times are recorded.

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
- 011-booking-stay
- 012-payments-payouts

### Enables
- 023-acute-event-response

## Test Expectations

Integration test; timeline JSON export; Playwright trigger.

Workbook evidence produced: Step 31.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
