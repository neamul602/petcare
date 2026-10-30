---
stage: model-design
bolt: 011-booking-stay
created: 2026-10-31T11:00:00Z
---

## Model, design and decisions: the stay (bolt 011)

Stories: BKG-10 start the stay, BKG-12 daily updates, BKG-14 vet-clinic directory, BKG-18 owner booking page during the stay. Booking chat (BKG-13) is deferred; the 18:00 reminder keeps only its non-notification part. Approved under the owner's standing instruction.

### Design

- **Start stay**: the provider's confirmed booking becomes in_stay on or after its start date (never before), under the booking lock. A scheduled check flags confirmed bookings not started by 12:00 on the start date (TD-12) with one audit entry per booking.
- **Daily update**: one multipart request with a note, a structured care log (medicines given with times, food, mood) and up to 4 photos (5 MB each) stored through the photo port. Updates are immutable: there is no edit or delete endpoint. Photos are optional. Updates are readable by the booking's owner and provider only, newest first.
- **18:00 reminder**: instead of a notification, the provider's Today and the booking page show "no update posted today" after 18:00 Dhaka time (config value). Completion is never blocked.
- **Offline**: the update form keeps what was typed and sends it once when back online (photos stay with the open page).
- **Vet clinics**: clinics in the booking provider's neighbourhood for owner and provider of a confirmed or in-stay booking; phone numbers are `tel:` links; text says it is a lookup, not a recommendation.
- **Owner page**: confirmed shows dates and provider; in stay shows updates newest first and the vet clinics; completed actions (confirm completion, review, report) arrive with bolts 013, 014 and 015.
