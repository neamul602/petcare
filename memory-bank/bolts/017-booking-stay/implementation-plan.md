---
stage: plan
bolt: 017-booking-stay
created: 2026-11-01T09:00:00Z
---

## Implementation Plan: bookings list and Book again (bolt 017)

Stories: BKG-17 owner bookings list, BKG-16 Book again (and the Book again card on Home from SRC-05). Simplest workable version.

- **Bookings list** (`/bookings`): the owner's bookings, upcoming (not yet finished) and past, each with its state pill; a completed stay offers Book again.
- **Book again**: tapping it asks the API to start a timer (stored on the server) and opens the normal Book flow for the same provider, pre-filled with the pet and the earlier instructions and marked "from Tito's last stay", with the same number of nights as a hint. Submitting works exactly like a first booking (a new payment hold, TD-5); the server records the submit time so the elapsed time is kept; the flow shows the elapsed time. If the provider is no longer available, the page says so and links to search.
- **Home**: a signed-in owner with a completed stay sees a Book again card for the latest one.
- No "faster than first booking" claim is shown (it needs both times for the same owner; UC-16).
