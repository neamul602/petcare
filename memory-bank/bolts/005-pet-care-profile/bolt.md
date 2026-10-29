---
id: 005-pet-care-profile
unit: 004-pet-care-profile
intent: 001-petcare-v1
type: simple-construction-bolt
status: complete
phase: Thin slice
stories:
  - 001-create-and-edit-a-pet-profile
  - 002-structured-care-plan
  - 003-reject-clinical-requests-at-intake
  - 004-pet-page-and-care-history
  - 005-care-plan-pre-fill
  - 006-provider-care-summary
created: '2026-10-29T17:00:00Z'
started: '2026-10-30T14:00:00Z'
completed: '2026-10-29T07:31:58Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-10-30T14:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 002-dummy-integration-services
  - 004-accounts-notifications
enables_bolts:
  - 007-search-capacity
  - 009-booking-stay
  - 010-booking-stay
  - 017-booking-stay
  - 018-pet-care-profile
requires_units:
  - accounts-notifications
  - dummy-integration-services
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 005-pet-care-profile

## Overview

Plan phase **Thin slice**, bolt 5 of 25. Journeys served: UJ-1, UJ-4.

## Objective

Pet profile with species fields and photos, structured care plan, clinical rejection, care history, pre-fill and the provider summary.

## Stories Included

- **001-create-and-edit-a-pet-profile** (PET-01): Create and edit a pet profile (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md)
- **002-structured-care-plan** (PET-02): Structured care plan (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/002-structured-care-plan.md)
- **003-reject-clinical-requests-at-intake** (PET-03): Reject clinical requests at intake (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/003-reject-clinical-requests-at-intake.md)
- **004-pet-page-and-care-history** (PET-04): Pet page and care history (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/004-pet-page-and-care-history.md)
- **005-care-plan-pre-fill** (PET-05): Care plan pre-fill (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/005-care-plan-pre-fill.md)
- **006-provider-care-summary** (PET-06): Provider care summary (Must) · [story](../../intents/001-petcare-v1/units/004-pet-care-profile/stories/006-provider-care-summary.md)

## Expected Outcome

Tito's full profile exists through the API (no hard-coded pets); clinical requests are rejected; care history and pre-fill APIs work.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- ✅ **1. Plan**: Complete → implementation-plan.md
- ⏳ **2. Implement**: In progress → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 002-dummy-integration-services
- 004-accounts-notifications

### Enables
- 007-search-capacity
- 009-booking-stay
- 010-booking-stay
- 017-booking-stay
- 018-pet-care-profile

## Test Expectations

API validation and authorization tests; Playwright pet profile.

Workbook evidence produced: Step 19.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
