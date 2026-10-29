---
id: 004-public-provider-page
code: SUP-04
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 006-provider-supply-vetting
implemented: true
---

# Story SUP-04: Public provider page

## User Story

**As a** owner
**I want** to see what a provider offers before booking
**So that** I can judge fit for my pet

## Acceptance Criteria

- [ ] **Given** an approved provider, **When** I open /providers/:slug, **Then** I see photos, services, price per night, location area, per-species capacity, capability flags and the experience statement
- [ ] **Given** Tier-A, **When** shown, **Then** the Admin-introduced badge appears with an accessible name; Tier-B shows none
- [ ] **Given** verification artifacts, **When** the page loads, **Then** none of them is in the response
- [ ] **Given** a provider without reviews, **When** shown, **Then** 'New to PetCare. Building a track record.' appears instead of ratings
- [ ] **Given** the primary action, **When** I tap Book, **Then** the Book flow opens for this provider

## Traceability

- **Requirements:** FR-5, FR-1, NFR-7; UC-9; page spec 1.4
- **Journeys:** UJ-1

## UI/UX Impact

O4 Provider; mockup 03-provider-profile

## API Dependencies (including Dummy APIs)

Providers API; Search & Capacity availability; Reviews section

## Test Expectations

API privacy test; Playwright

## Dependencies

### Requires
- SUP-01 Provider records, tiers and status (`005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md`)

### Enables
- SUP-05 Provider profile editor (`005-provider-supply-vetting/stories/005-provider-profile-editor.md`)
- SRC-04 Curated shortlist (`006-search-capacity/stories/004-curated-shortlist.md`)
- REV-02 Public reviews and aggregates (`009-reviews-disputes/stories/002-public-reviews-and-aggregates.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Provider suspended while viewing | Book disabled with explanation |

## Out of Scope

- Reviews content (REV-02)
