---
id: 001-dummy-service-host-and-training-controls
code: DUM-01
unit: 002-dummy-integration-services
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 002-dummy-integration-services
implemented: false
---

# Story DUM-01: Dummy service host and training controls

## User Story

**As a** tester
**I want** every Dummy API to have health, reset, inspection and switchable failure modes
**So that** I can prove PetCare behaves safely when an external system misbehaves

## Acceptance Criteria

- [ ] **Given** the Dummy service, **When** I call health for each of the five APIs, **Then** each answers with its status
- [ ] **Given** any API, **When** I call reset, **Then** its stored state is empty again
- [ ] **Given** any API, **When** I call inspect, **Then** I see every request it received with time and body
- [ ] **Given** any API, **When** I set failure mode to down, timeout, decline or ambiguous, **Then** the next calls behave that way until the mode is cleared

## Traceability

- **Requirements:** TR-6; workbook Step 16
- **Journeys:** all

## UI/UX Impact

None (API)

## API Dependencies (including Dummy APIs)

Health, reset, inspect, failure-mode endpoints

## Test Expectations

API tests per mode

## Dependencies

### Requires
- FND-01 Workspace and app shell (`001-platform-foundation/stories/001-workspace-and-app-shell.md`)

### Enables
- DUM-02 Dummy SMS / OTP API (`002-dummy-integration-services/stories/002-dummy-sms-otp-api.md`)
- DUM-03 Dummy payment gateway API (`002-dummy-integration-services/stories/003-dummy-payment-gateway-api.md`)
- DUM-04 Dummy MFS payout API (`002-dummy-integration-services/stories/004-dummy-mfs-payout-api.md`)
- DUM-05 Dummy notification and photo APIs (`002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Ambiguous mode | The action is applied but the response is lost (timeout to caller) |

## Out of Scope

- Real provider contracts
