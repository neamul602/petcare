---
id: 003-bangla-and-english-with-parity
code: FND-03
unit: 001-platform-foundation
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-2, UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 001-platform-foundation
implemented: true
---

# Story FND-03: Bangla and English with parity

## User Story

**As a** owner or provider
**I want** the app in Bangla by default with English one tap away
**So that** I can use PetCare comfortably in my own language

## Acceptance Criteria

- [ ] **Given** a first visit, **When** any owner or provider screen opens, **Then** text is Bangla
- [ ] **Given** the header toggle, **When** I switch to English, **Then** the same screen shows English and the choice persists across visits
- [ ] **Given** the admin console, **When** it opens, **Then** all text is English and no language toggle appears
- [ ] **Given** the message catalogs, **When** CI runs the parity check, **Then** the build fails if any key exists in one language but not the other
- [ ] **Given** an amount, date or count, **When** shown, **Then** the locale helper formats it consistently (BDT, digits and dates per the agreed rule, UC-13)

## Traceability

- **Requirements:** FR-47, NFR-12, NFR-13; UC-13; C-1
- **Journeys:** UJ-1, UJ-2, UJ-4

## UI/UX Impact

All owner/provider screens; page-spec EN + BN content blocks

## API Dependencies (including Dummy APIs)

None

## Test Expectations

i18n parity check (STEP-32 evidence); Playwright language switch

## Dependencies

### Requires
- FND-01 Workspace and app shell (`001-platform-foundation/stories/001-workspace-and-app-shell.md`)

### Enables
- ACC-01 Sign in with phone OTP (`003-accounts-notifications/stories/001-sign-in-with-phone-otp.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Key missing in bn | Build fails, not a runtime fallback |
| User-entered Bangla names | Stored and shown unchanged |

## Out of Scope

- Languages other than Bangla and English
- RTL
