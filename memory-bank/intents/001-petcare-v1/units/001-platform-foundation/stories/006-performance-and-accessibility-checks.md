---
id: 006-performance-and-accessibility-checks
code: FND-06
unit: 001-platform-foundation
intent: 001-petcare-v1
status: complete
priority: should
journeys: all
created: '2026-10-29T16:00:00Z'
assigned_bolt: 003-platform-foundation
implemented: true
---

# Story FND-06: Performance and accessibility checks

## User Story

**As a** owner on a low-end phone
**I want** screens that load fast and work with assistive technology
**So that** PetCare is usable on Android 9 with 2 GB RAM over 4G

## Acceptance Criteria

- [ ] **Given** a production build, **When** CI measures the owner home, **Then** the initial payload is under 500 KB
- [ ] **Given** a throttled 4G profile, **When** owner and provider primary screens load, **Then** time to interactive is under 3 s
- [ ] **Given** each screen in the E2E suite, **When** the accessibility scan runs, **Then** there are no WCAG 2.1 AA violations
- [ ] **Given** any screen, **When** navigated by keyboard, **Then** focus is visible, order is logical and a skip link exists

## Traceability

- **Requirements:** NFR-1, NFR-2, NFR-15, DR-19
- **Journeys:** all

## UI/UX Impact

All screens

## API Dependencies (including Dummy APIs)

None

## Test Expectations

Bundle budget check, Lighthouse JSON (STEP-32 evidence), axe in Playwright

## Dependencies

### Requires
- FND-04 PWA, offline and shared states (`001-platform-foundation/stories/004-pwa-offline-and-shared-states.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Budget exceeded | CI fails with the offending bundle named |

## Out of Scope

- Real device lab (emulation only)
