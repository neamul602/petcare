---
id: 005-dummy-notification-and-photo-apis
code: DUM-05
unit: 002-dummy-integration-services
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 002-dummy-integration-services
implemented: true
---

# Story DUM-05: Dummy notification and photo APIs

## User Story

**As a** tester
**I want** training services that accept notifications and store photos
**So that** messages and stay photos can be tested and inspected

## Acceptance Criteria

- [ ] **Given** POST /api/notifications, **When** called, **Then** the message is stored and visible in inspection
- [ ] **Given** POST /api/photos with an image up to 5 MB, **When** called, **Then** an id and URL are returned and GET /api/photos/:photoId returns the image
- [ ] **Given** an image above 5 MB or not an image, **When** uploaded, **Then** it is rejected
- [ ] **Given** failure mode timeout, **When** a photo is uploaded, **Then** the caller sees a timeout

## Traceability

- **Requirements:** TR-4, TR-5
- **Journeys:** UJ-1

## UI/UX Impact

None

## API Dependencies (including Dummy APIs)

POST /api/notifications, POST /api/photos, GET /api/photos/:photoId

## Test Expectations

API tests

## Dependencies

### Requires
- DUM-01 Dummy service host and training controls (`002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md`)

### Enables
- ACC-03 Notification port and delivery (`003-accounts-notifications/stories/003-notification-port-and-delivery.md`)
- PET-01 Create and edit a pet profile (`004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md`)
- BKG-12 Daily updates (`008-booking-stay/stories/012-daily-updates.md`)
- REV-01 Leave a verified review (`009-reviews-disputes/stories/001-leave-a-verified-review.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Video file | Rejected (TD-15) |

## Out of Scope

- Real SMS/email/push delivery
- Video
