---
id: 003-moderate-reviews-for-cause
code: REV-03
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 022-reviews-disputes
implemented: true
---

# Story REV-03: Moderate reviews for cause

## User Story

**As a** admin
**I want** to remove a review for abuse, off-topic content or off-platform contact details
**So that** reviews stay useful and safe

## Acceptance Criteria

- [ ] **Given** A5 Reviews, **When** opened, **Then** recent reviews are listed for moderation
- [ ] **Given** Remove, **When** I choose a reason, **Then** the review is hidden from the public, kept on record and audit-logged
- [ ] **Given** a critical 1-3 star review, **When** I act, **Then** the SM-C3 banner reminds me not to remove for being negative
- [ ] **Given** the owner, **When** they open the booking, **Then** they see the moderation result read-only (no appeal, UC-5)

## Traceability

- **Requirements:** FR-23, FR-22; UC-5; page specs 4.7, 5.4
- **Journeys:** UJ-3

## UI/UX Impact

A5 Reviews; mockup 47-review-moderation-queue; O6 Booking

## API Dependencies (including Dummy APIs)

Reviews API; audit via ACC-02

## Test Expectations

API and Playwright

## Dependencies

### Requires
- REV-02 Public reviews and aggregates (`009-reviews-disputes/stories/002-public-reviews-and-aggregates.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Review with an open report | Moderation does not touch the report |

## Out of Scope

- Pre-moderation
- Appeals
