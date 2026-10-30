---
id: 016-book-again
code: BKG-16
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 017-booking-stay
implemented: true
---

# Story BKG-16: Book again

## User Story

**As a** returning owner
**I want** to book the same provider again with everything pre-filled
**So that** my second booking takes minutes, not a form

## Acceptance Criteria

- [ ] **Given** a completed stay, **When** I tap Book again on Home or Bookings, **Then** the Book flow opens pre-filled with pet, care plan, prior instructions and a dates template, marked 'from Tito's last stay'
- [ ] **Given** the flow, **When** I review and submit with payment, **Then** it works exactly like a first booking (new authorization, TD-5)
- [ ] **Given** the timer, **When** I tap Book again, **Then** elapsed time is shown and stored on the server until submission
- [ ] **Given** UJ-4, **When** measured, **Then** Book again to submitted request takes under 4 minutes
- [ ] **Given** 'faster than first booking', **When** both times are not recorded for this owner, **Then** it is not shown (UC-16)

## Traceability

- **Requirements:** FR-48, FR-8, UJ-4, SM-15; TD-5; UC-15, UC-16; page spec 2.2
- **Journeys:** UJ-4

## UI/UX Impact

O1 Home card, O7 Bookings, O5 Book; mockup 22-book-again-path

## API Dependencies (including Dummy APIs)

Bookings API; PET-05; PAY-01

## Test Expectations

Playwright timing (STEP-28)

## Dependencies

### Requires
- BKG-03 Review and submit with payment (`008-booking-stay/stories/003-review-and-submit-with-payment.md`)
- PET-05 Care plan pre-fill (`004-pet-care-profile/stories/005-care-plan-pre-fill.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Provider now unavailable | Shown at step 1 with alternatives |

## Out of Scope

- Repeat discount
