---
id: 004-inbox
code: ACC-04
unit: 003-accounts-notifications
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 016-accounts-notifications
implemented: false
---

# Story ACC-04: Inbox

## User Story

**As a** owner, provider or admin
**I want** one inbox with my notifications, newest first
**So that** I can catch up on anything I missed

## Acceptance Criteria

- [ ] **Given** notifications, **When** I open Inbox, **Then** they are listed newest first with unread markers and each links to its booking or item
- [ ] **Given** an unread notification, **When** I open it, **Then** it is marked read and the tab badge updates
- [ ] **Given** no notifications, **When** I open Inbox, **Then** the shared empty state shows

## Traceability

- **Requirements:** DR-20; page specs 5.5 and 5.9 merged (UC-19)
- **Journeys:** UJ-1

## UI/UX Impact

O9 Inbox; provider and admin inbox

## API Dependencies (including Dummy APIs)

Inbox API

## Test Expectations

Playwright

## Dependencies

### Requires
- ACC-03 Notification port and delivery (`003-accounts-notifications/stories/003-notification-port-and-delivery.md`)
- FND-04 PWA, offline and shared states (`001-platform-foundation/stories/004-pwa-offline-and-shared-states.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Many notifications | Paged list |

## Out of Scope

- Archive rules
