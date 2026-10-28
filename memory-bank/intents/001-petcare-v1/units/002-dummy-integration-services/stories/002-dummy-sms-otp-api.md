---
id: 002-dummy-sms-otp-api
code: DUM-02
unit: 002-dummy-integration-services
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 002-dummy-integration-services
implemented: false
---

# Story DUM-02: Dummy SMS / OTP API

## User Story

**As a** tester
**I want** a training OTP service
**So that** sign-in can be tested without a real SMS provider

## Acceptance Criteria

- [ ] **Given** POST /api/otp/send with a phone, **When** called, **Then** a code is created and visible in inspection
- [ ] **Given** POST /api/otp/verify, **When** the right code is sent before expiry, **Then** it returns verified
- [ ] **Given** a wrong or expired code, **When** verified, **Then** it returns not verified
- [ ] **Given** failure mode down, **When** send is called, **Then** it fails like an unavailable provider

## Traceability

- **Requirements:** TR-3, DR-1
- **Journeys:** UJ-1

## UI/UX Impact

None

## API Dependencies (including Dummy APIs)

POST /api/otp/send, POST /api/otp/verify

## Test Expectations

API tests incl. failure modes (STEP-18)

## Dependencies

### Requires
- DUM-01 Dummy service host and training controls (`002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md`)

### Enables
- ACC-01 Sign in with phone OTP (`003-accounts-notifications/stories/001-sign-in-with-phone-otp.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Too many attempts | Refused after the configured limit |

## Out of Scope

- Real SMS delivery
