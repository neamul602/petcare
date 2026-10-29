---
id: 001-workspace-and-app-shell
code: FND-01
unit: 001-platform-foundation
intent: 001-petcare-v1
status: complete
priority: must
journeys: all
created: '2026-10-29T16:00:00Z'
assigned_bolt: 001-platform-foundation
implemented: true
---

# Story FND-01: Workspace and app shell

## User Story

**As a** developer and every user
**I want** one workspace that starts web, API and Dummy services, with the app shell and navigation for each role
**So that** every later story plugs into the same structure and people always know where they are

## Acceptance Criteria

- [ ] **Given** a fresh clone, **When** I run the documented install and dev commands, **Then** apps/web, apps/api and apps/dummy-services start and each health endpoint answers
- [ ] **Given** a signed-in owner, **When** any owner screen opens, **Then** a bottom tab bar shows Home, Bookings, Pets, Inbox and the header holds the menu and language toggle
- [ ] **Given** a signed-in provider, **When** any provider screen opens, **Then** the tab bar shows Today, Calendar, Bookings, Earnings, Profile
- [ ] **Given** the admin, **When** any admin screen opens, **Then** a left sidebar shows Queue, Providers, Reviews, Payouts, Insights, Audit log and collapses to a menu below 768 px
- [ ] **Given** any route in experience-blueprint section 3, **When** it is requested, **Then** it resolves to a placeholder screen with the right shell

## Traceability

- **Requirements:** FR-46, NFR-14; experience-blueprint §2-3; UC-17
- **Journeys:** all

## UI/UX Impact

App shell for O1-O10, P1-P6, A1-A8

## API Dependencies (including Dummy APIs)

Health endpoints only

## Test Expectations

Playwright smoke at 390 px and 1280 px; route table test

## Dependencies

### Requires
- None

### Enables
- FND-02 Design tokens and UI kit (`001-platform-foundation/stories/002-design-tokens-and-ui-kit.md`)
- FND-03 Bangla and English with parity (`001-platform-foundation/stories/003-bangla-and-english-with-parity.md`)
- FND-04 PWA, offline and shared states (`001-platform-foundation/stories/004-pwa-offline-and-shared-states.md`)
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)
- DUM-01 Dummy service host and training controls (`002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unknown route | Friendly not-found screen with a way home |
| Narrow screen 320 px | No horizontal scroll |

## Out of Scope

- Real screen content (built by each unit)
