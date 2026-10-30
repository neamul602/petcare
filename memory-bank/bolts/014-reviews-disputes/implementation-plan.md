---
stage: plan
bolt: 014-reviews-disputes
created: 2026-10-31T19:00:00Z
---

## Implementation Plan: reviews and report a problem (bolt 014)

Stories: REV-01 leave a verified review, REV-02 public reviews and aggregates, REV-05 report a problem. Moderation, the provider care record and investigation (REV-03, REV-04, REV-06) are bolt 022. Kept simple, as the owner asked.

### Simplest workable design

- **Review**: only the owner of a completed booking, once. Rating 1-5 required, text optional. Photos are chosen from the photos the provider posted during the stay, so they are tagged to the booking and come from the stay window by construction; no new upload path. An open report does not block a review.
- **Public reviews**: newest first on the provider page with a "verified" mark and photos; average rating and the share of reviews with photos are computed from real reviews only; no reviews shows the new-provider message. Reviews never affect search. A removed review is hidden but stays stored (moderation comes later).
- **Report a problem**: owner of a completed booking, within 72 hours of completion, one report, one category from the six, a description and up to 5 stay photos. It moves the booking to disputed, freezes the payout and appears in the admin list (`GET /admin/reports`). The review is untouched.
- Screens: the review form and the report form sit on the owner's completed booking page; reviews show on the public provider page.
