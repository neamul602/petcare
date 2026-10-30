---
id: 005-settings
code: ACC-05
unit: 003-accounts-notifications
intent: 001-petcare-v1
status: complete
priority: should
journeys: none
created: '2026-10-29T16:00:00Z'
assigned_bolt: 016-accounts-notifications
implemented: true
---

# Story ACC-05: Settings

## User Story

**As a** owner, provider or admin
**I want** to see and change my name, language and notification choices
**So that** the app fits me

## Acceptance Criteria

- [ ] **Given** Settings, **When** I change my name or language, **Then** it is saved and used everywhere
- [ ] **Given** notification choices, **When** I turn a type off, **Then** I stop receiving it except acute-event messages, which cannot be turned off
- [ ] **Given** Settings, **When** shown, **Then** my verified phone is shown read-only

## Traceability

- **Requirements:** FR-47; page spec 5.10
- **Journeys:** none

## UI/UX Impact

O10 Settings; provider and admin settings

## API Dependencies (including Dummy APIs)

Settings API

## Test Expectations

Playwright

## Dependencies

### Requires
- ACC-01 Sign in with phone OTP (`003-accounts-notifications/stories/001-sign-in-with-phone-otp.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Admin settings | English only |

## Out of Scope

- Changing phone number
- Account deletion flow
