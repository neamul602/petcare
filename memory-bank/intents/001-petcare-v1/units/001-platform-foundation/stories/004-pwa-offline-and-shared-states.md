---
id: 004-pwa-offline-and-shared-states
code: FND-04
unit: 001-platform-foundation
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 003-platform-foundation
implemented: false
---

# Story FND-04: PWA, offline and shared states

## User Story

**As a** owner or provider on a weak connection
**I want** an installable app that tells me clearly when it is loading, empty, offline or failed
**So that** I am never confused or stuck when the connection drops

## Acceptance Criteria

- [ ] **Given** a supported mobile browser, **When** I open PetCare, **Then** it can be added to the home screen (valid manifest and service worker)
- [ ] **Given** I go offline, **When** I open a cached screen (pet, care history, booking), **Then** it shows the last data and the banner 'Offline. Bookings will be sent when you're back online.'
- [ ] **Given** a form, **When** I type and lose connection, **Then** my input is kept on the device and restored
- [ ] **Given** any list or page, **When** data is loading, empty or failed, **Then** the shared loading, empty or error pattern (page specs 5.11-5.13) is shown with a clear next action
- [ ] **Given** an empty state, **When** shown, **Then** it contains no invented content or numbers

## Traceability

- **Requirements:** FR-46, DR-18, NFR-15; page specs 5.11, 5.12, 5.13; EXPERIENCE connectivity state
- **Journeys:** all

## UI/UX Impact

Shared components for every screen

## API Dependencies (including Dummy APIs)

None

## Test Expectations

Playwright offline mode; Lighthouse PWA audit

## Dependencies

### Requires
- FND-01 Workspace and app shell (`001-platform-foundation/stories/001-workspace-and-app-shell.md`)
- FND-02 Design tokens and UI kit (`001-platform-foundation/stories/002-design-tokens-and-ui-kit.md`)

### Enables
- FND-06 Performance and accessibility checks (`001-platform-foundation/stories/006-performance-and-accessibility-checks.md`)
- ACC-04 Inbox (`003-accounts-notifications/stories/004-inbox.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Slow connection | Background sync queued, animations off |
| Service worker update | New version activates on next visit |

## Out of Scope

- Native push notifications
