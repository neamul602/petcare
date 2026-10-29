---
id: 011-booking-stay
unit: 008-booking-stay
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 010-start-the-stay
  - 012-daily-updates
  - 014-vet-clinic-directory
  - 018-owner-booking-page-during-the-stay
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [002-dummy-integration-services, 003-platform-foundation, 010-booking-stay]
enables_bolts: [013-booking-stay, 015-acute-event-response]
requires_units: [dummy-integration-services, platform-foundation]
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 011-booking-stay

## Overview

Plan phase **UJ-1 complete**, bolt 11 of 25. Journeys served: UJ-1, UJ-2.

## Objective

The stay: start stay, daily updates with photos, vet clinics and the owner's booking page during the stay. (Booking chat, BKG-13, and scheduled reminders are deferred.)

## Stories Included

- **010-start-the-stay** (BKG-10): Start the stay (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/010-start-the-stay.md)
- **012-daily-updates** (BKG-12): Daily updates (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/012-daily-updates.md)
- **014-vet-clinic-directory** (BKG-14): Vet-clinic directory (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/014-vet-clinic-directory.md)
- **018-owner-booking-page-during-the-stay** (BKG-18): Owner booking page during the stay (Must) · [story](../../intents/001-petcare-v1/units/008-booking-stay/stories/018-owner-booking-page-during-the-stay.md)

## Expected Outcome

Rashid posts updates (also after a lost connection); Bibi sees them, chats and opens the vet clinics on one booking page.

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
- 002-dummy-integration-services
- 003-platform-foundation
- 010-booking-stay

### Enables
- 013-booking-stay
- 015-acute-event-response

## Test Expectations

Playwright incl. offline photo upload; reminder test with the clock.

Workbook evidence produced: Step 26.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
