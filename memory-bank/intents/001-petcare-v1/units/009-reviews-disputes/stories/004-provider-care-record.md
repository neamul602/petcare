---
id: 004-provider-care-record
code: REV-04
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 022-reviews-disputes
implemented: false
---

# Story REV-04: Provider care record

## User Story

**As a** provider
**I want** to see the stays I have completed by care need
**So that** I can see my track record grow

## Acceptance Criteria

- [ ] **Given** completed, reviewed bookings, **When** I open the Care record tab, **Then** counts by care need (for example diabetic, senior) are computed from those bookings
- [ ] **Given** no completed bookings, **When** opened, **Then** an empty state explains how the record grows
- [ ] **Given** the record, **When** used, **Then** it never affects ranking

## Traceability

- **Requirements:** DR-15, NFR-26; UC-9; page spec 3.9
- **Journeys:** UJ-2

## UI/UX Impact

P6 Profile (Care record tab)

## API Dependencies (including Dummy APIs)

Reviews API

## Test Expectations

API test

## Dependencies

### Requires
- REV-01 Leave a verified review (`009-reviews-disputes/stories/001-leave-a-verified-review.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Fit ranking
