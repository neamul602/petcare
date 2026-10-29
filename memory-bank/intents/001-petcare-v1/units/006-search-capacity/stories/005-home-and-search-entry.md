---
id: 005-home-and-search-entry
code: SRC-05
unit: 006-search-capacity
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 007-search-capacity
implemented: true
---

# Story SRC-05: Home and search entry

## User Story

**As a** owner or guest
**I want** a home screen that starts my search in one step
**So that** finding care is quick

## Acceptance Criteria

- [ ] **Given** a guest, **When** I open /, **Then** I see the promise, how it works and Find care, with no invented statistics
- [ ] **Given** a signed-in owner, **When** I open /, **Then** I can pick neighbourhood (launch areas only), dates and species and search
- [ ] **Given** a past completed stay, **When** I open /, **Then** a Book again card for that provider and pet appears

## Traceability

- **Requirements:** FR-13, FR-48; UC-10; page spec 1.1
- **Journeys:** UJ-1, UJ-4

## UI/UX Impact

O1 Home; mockup 01-home (layout only)

## API Dependencies (including Dummy APIs)

Search API; Bookings API

## Test Expectations

Playwright

## Dependencies

### Requires
- SRC-04 Curated shortlist (`006-search-capacity/stories/004-curated-shortlist.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Saved searches | Not built |

## Out of Scope

- Marketing CMS
