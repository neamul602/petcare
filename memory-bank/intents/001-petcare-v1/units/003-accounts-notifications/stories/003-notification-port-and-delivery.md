---
id: 003-notification-port-and-delivery
code: ACC-03
unit: 003-accounts-notifications
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 004-accounts-notifications
implemented: false
---

# Story ACC-03: Notification port and delivery

## User Story

**As a** owner, provider or admin
**I want** to be told about events that matter, in my language
**So that** I never miss a confirmation, update or acute event

## Acceptance Criteria

- [ ] **Given** a domain event, **When** another unit asks to notify, **Then** a notification record is stored and sent through the notification port in the recipient's language (admin: English)
- [ ] **Given** the notification service is down, **When** sending, **Then** the business action still succeeds, delivery is retried and the failure is visible to the admin
- [ ] **Given** a scheduled message (for example a reminder), **When** its time comes on the injectable clock, **Then** it is sent once

## Traceability

- **Requirements:** DR-20, DR-21; C-9
- **Journeys:** all

## UI/UX Impact

None directly

## API Dependencies (including Dummy APIs)

notification port -> Dummy Notification

## Test Expectations

Integration tests with failure modes

## Dependencies

### Requires
- DUM-05 Dummy notification and photo APIs (`002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md`)
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)

### Enables
- ACC-04 Inbox (`003-accounts-notifications/stories/004-inbox.md`)
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)
- ACU-02 Acute-event effects and owner notice (`010-acute-event-response/stories/002-acute-event-effects-and-owner-notice.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Same event raised twice | One notification |

## Out of Scope

- Native web push
