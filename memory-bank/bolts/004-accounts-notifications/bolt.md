---
id: 004-accounts-notifications
unit: 003-accounts-notifications
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-sign-in-with-phone-otp
  - 002-admin-sign-in-and-role-guards
  - 003-notification-port-and-delivery
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [001-platform-foundation, 002-dummy-integration-services]
enables_bolts: [005-pet-care-profile, 006-provider-supply-vetting, 010-booking-stay, 015-acute-event-response, 016-accounts-notifications, 018-pet-care-profile, 022-reviews-disputes, 023-acute-event-response, 024-admin-operations, 025-admin-operations]
requires_units: [dummy-integration-services, platform-foundation]
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 004-accounts-notifications

## Overview

Plan phase **Thin slice**, bolt 4 of 25. Journeys served: UJ-1, UJ-3.

## Objective

Phone-OTP sign-in for owners and providers, separate admin sign-in with role guards and audit entries, and the notification port.

## Stories Included

- **001-sign-in-with-phone-otp** (ACC-01): Sign in with phone OTP (Must) · [story](../../intents/001-petcare-v1/units/003-accounts-notifications/stories/001-sign-in-with-phone-otp.md)
- **002-admin-sign-in-and-role-guards** (ACC-02): Admin sign-in and role guards (Must) · [story](../../intents/001-petcare-v1/units/003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md)
- **003-notification-port-and-delivery** (ACC-03): Notification port and delivery (Must) · [story](../../intents/001-petcare-v1/units/003-accounts-notifications/stories/003-notification-port-and-delivery.md)

## Expected Outcome

Bibi and Rashid sign in with a Dummy OTP; Ayaat signs in to /admin; cross-role calls are refused; notifications reach the Dummy service and failures never block actions.

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
- 002-dummy-integration-services

### Enables
- 005-pet-care-profile
- 006-provider-supply-vetting
- 010-booking-stay
- 015-acute-event-response
- 016-accounts-notifications
- 018-pet-care-profile
- 022-reviews-disputes
- 023-acute-event-response
- 024-admin-operations
- 025-admin-operations

## Test Expectations

API authorization matrix; OTP failure-mode tests; Playwright sign-in.

Workbook evidence produced: Step 19 (OTP).

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
