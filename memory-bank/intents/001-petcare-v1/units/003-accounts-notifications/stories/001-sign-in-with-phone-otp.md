---
id: 001-sign-in-with-phone-otp
code: ACC-01
unit: 003-accounts-notifications
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 004-accounts-notifications
implemented: false
---

# Story ACC-01: Sign in with phone OTP

## User Story

**As a** owner or provider
**I want** to sign in with my phone number and a one-time code
**So that** I can book or manage bookings without a password

## Acceptance Criteria

- [ ] **Given** /sign-in, **When** I enter a +880 number and request a code, **Then** a code is sent through the OTP port and a 60 s resend timer shows
- [ ] **Given** the right code, **When** I submit it, **Then** I am signed in; a new owner is asked for name and neighbourhood (Gulshan, Banani or Baridhara only)
- [ ] **Given** a provider's phone, **When** verified, **Then** I land on /provider; a phone without an approved provider record never gets provider access
- [ ] **Given** a wrong, expired or reused code, **When** submitted, **Then** sign-in is refused with a clear message
- [ ] **Given** the OTP service is down, **When** I request a code, **Then** I see a safe failure message and can retry (STEP-35)

## Traceability

- **Requirements:** DR-1, DR-2, DR-21, NFR-6; UC-10
- **Journeys:** UJ-1

## UI/UX Impact

O2 Sign in; page spec 1.2 (spec-only)

## API Dependencies (including Dummy APIs)

otp port -> Dummy SMS/OTP

## Test Expectations

API and Playwright; failure-mode test

## Dependencies

### Requires
- FND-03 Bangla and English with parity (`001-platform-foundation/stories/003-bangla-and-english-with-parity.md`)
- DUM-02 Dummy SMS / OTP API (`002-dummy-integration-services/stories/002-dummy-sms-otp-api.md`)

### Enables
- ACC-05 Settings (`003-accounts-notifications/stories/005-settings.md`)
- PET-01 Create and edit a pet profile (`004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md`)
- BKG-05 Provider Today and Bookings (`008-booking-stay/stories/005-provider-today-and-bookings.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Delayed SMS | Resend after cooldown; attempt limit |
| Neighbourhood outside launch areas | Not offered |

## Out of Scope

- Email sign-in
- Passwords
