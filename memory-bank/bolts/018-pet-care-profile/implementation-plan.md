---
stage: plan
bolt: 018-pet-care-profile
created: 2026-11-01T11:00:00Z
---

## Implementation Plan: archive and retention (bolt 018)

Story PET-07. Simplest workable version.

- **Archive** already hides a pet from the active list and offers no archived pet in the Book flow while keeping bookings and history (bolt 005). New: Book again with an archived pet does not pre-select it.
- **Retention (24 months, FR-10)**: the admin can ask for a pet's retention status (last booking end, retained until, inside or outside the window). The admin can delete an archived pet's records only when the pet has no booking inside the window; the deletion is an audited event. A pet whose bookings are older than the window is deleted together with its care history and photos but its past booking rows stay, anonymised to the pet copy already stored on each booking.
- **Not built (simplest workable)**: owner account closure and re-verification to recover records (there is no account-closure feature in v1 screens); physical purge of expired booking-side records (updates, reviews, payments). Both are recorded in `deferred-scope.md`.
