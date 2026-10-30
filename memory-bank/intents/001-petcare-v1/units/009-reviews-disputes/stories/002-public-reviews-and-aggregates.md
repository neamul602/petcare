---
id: 002-public-reviews-and-aggregates
code: REV-02
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 014-reviews-disputes
implemented: true
---

# Story REV-02: Public reviews and aggregates

## User Story

**As a** owner
**I want** to read verified reviews on a provider page
**So that** I can judge real experience

## Acceptance Criteria

- [ ] **Given** a provider with reviews, **When** I open the page, **Then** reviews show newest first, marked verified, with photos
- [ ] **Given** reviews, **When** aggregated, **Then** average rating and review-with-photos rate are computed from real reviews only
- [ ] **Given** no reviews, **When** shown, **Then** 'New to PetCare. Building a track record.' appears
- [ ] **Given** search ranking, **When** computed, **Then** reviews are never used

## Traceability

- **Requirements:** FR-23, DR-15, NFR-26; UC-9
- **Journeys:** UJ-1

## UI/UX Impact

O4 Provider (reviews section)

## API Dependencies (including Dummy APIs)

Reviews API

## Test Expectations

API tests; seed check

## Dependencies

### Requires
- REV-01 Leave a verified review (`009-reviews-disputes/stories/001-leave-a-verified-review.md`)
- SUP-04 Public provider page (`005-provider-supply-vetting/stories/004-public-provider-page.md`)

### Enables
- REV-03 Moderate reviews for cause (`009-reviews-disputes/stories/003-moderate-reviews-for-cause.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Removed review | Not shown, still stored |

## Out of Scope

- Provider responses
