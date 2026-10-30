---
stage: implement
bolt: 017-booking-stay
created: 2026-11-01T10:00:00Z
---

## Implementation Walkthrough: bookings list and Book again (bolt 017)

### Summary

The Bookings tab lists the owner's upcoming and past bookings with state pills. A completed stay offers Book again (on the list, on the booking page and as a card on Home): it opens the normal Book flow for the same provider with the pet and earlier instructions pre-filled and shows the time elapsed; the server stores the start and submit times.

### Completed Work

- [x] `apps/api/src/db/schema/bookings.ts`, `drizzle/0014_book_again.sql` - the Book again timer
- [x] `apps/api/src/bookings/book-again.ts` - `GET /owner/bookings`, `POST /owner/book-again`, `GET /owner/book-again/:id`; submit accepts `bookAgainId`
- [x] Web: `/bookings` list, Book again buttons, Home card, pre-filled `BookFlow` with an elapsed timer, "provider no longer available" card with a link to search
- [x] 10 new strings (501 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). Book again always makes a new payment hold (TD-5). The dates stay empty; the earlier number of nights is shown as a hint. No "faster than first booking" claim is shown (UC-16).
