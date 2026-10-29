---
id: 013-booking-chat
code: BKG-13
unit: 008-booking-stay
intent: 001-petcare-v1
status: deferred
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: null
implemented: false
---

# Story BKG-13: Booking chat

> **DEFERRED (owner decision, 2026-10-29):** Live booking chat is skipped for now and tracked in `memory-bank/deferred-scope.md`. The acceptance criteria below are kept for when it is picked up again.

## User Story

**As a** owner or provider
**I want** to message each other inside the booking
**So that** questions are answered without leaving PetCare

## Acceptance Criteria

- [ ] **Given** a confirmed or in-stay booking, **When** I send a message, **Then** the other side sees it on the booking page
- [ ] **Given** a dropped connection, **When** I send, **Then** it is kept and sent later
- [ ] **Given** another booking, **When** opened, **Then** its chat is separate
- [ ] **Given** the admin with a cause, **When** investigating, **Then** the chat is readable

## Traceability

- **Requirements:** FR-44, NFR-8
- **Journeys:** UJ-1

## UI/UX Impact

O6, P3 (chat section)

## API Dependencies (including Dummy APIs)

Bookings API (messages)

## Test Expectations

Playwright (STEP-26)

## Dependencies

### Requires
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)

### Enables
- BKG-18 Owner booking page during the stay (`008-booking-stay/stories/018-owner-booking-page-during-the-stay.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Booking completed | Chat read-only |

## Out of Scope

- Voice or video
