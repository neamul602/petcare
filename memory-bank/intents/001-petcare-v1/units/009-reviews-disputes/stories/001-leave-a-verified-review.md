---
id: 001-leave-a-verified-review
code: REV-01
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 014-reviews-disputes
implemented: true
---

# Story REV-01: Leave a verified review

## User Story

**As a** owner
**I want** to rate the stay and add text and photos from the stay
**So that** other owners can trust what they read

## Acceptance Criteria

- [ ] **Given** a completed booking, **When** I open the review section, **Then** I can give a rating 1-5 (required), text and photos (optional)
- [ ] **Given** a booking that is not completed, **When** I try to review, **Then** it is refused
- [ ] **Given** a second review on the same booking, **When** submitted, **Then** it is refused
- [ ] **Given** photos, **When** uploaded, **Then** they are tagged to the booking and must come from the stay window
- [ ] **Given** an open report on the booking, **When** I review, **Then** it is still allowed (FR-22)

## Traceability

- **Requirements:** FR-20, FR-21, FR-22; UC-12; page spec 5.2
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking (review section); page spec 5.2 (spec-only)

## API Dependencies (including Dummy APIs)

Reviews API; photo port

## Test Expectations

API tests (STEP-35 rows); Playwright (STEP-27)

## Dependencies

### Requires
- BKG-15 Mark complete and confirm completion (`008-booking-stay/stories/015-mark-complete-and-confirm-completion.md`)
- DUM-05 Dummy notification and photo APIs (`002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md`)

### Enables
- REV-02 Public reviews and aggregates (`009-reviews-disputes/stories/002-public-reviews-and-aggregates.md`)
- REV-04 Provider care record (`009-reviews-disputes/stories/004-provider-care-record.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Photo upload lost | Retried; review saved once photo ids exist |

## Out of Scope

- Video reviews
