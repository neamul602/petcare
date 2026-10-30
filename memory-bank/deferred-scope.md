# Deferred scope (skipped for now, revisit later)

Owner decision, 2026-10-29: complex features are skipped for now even where the PRD, requirements or stories include them. They stay recorded here so nothing is lost. The Dummy APIs for OTP, notifications and photos (bolt 002) stay, because the workbook requires them as training substitutes for the real services.

| Deferred feature | Where it appears | What is skipped | Simplest stand-in until revisited |
|---|---|---|---|
| Live chat system | FR-44; story BKG-13; blueprint O6/P3 chat section | Real-time booking chat, delivery, read state, offline queue | Booking page shows a "Chat comes later" note; no messages stored |
| Notification system | DR-20; stories ACC-03, ACC-04, ACC-05 (preferences); reminders in BKG-12 (TD-11); owner timeout notice in BKG-09; owner notices in ACU-02 | Notification port with retry and failure tracking, inbox screens, reminder scheduler, notification preferences | State changes show on the booking page itself; no inbox, no scheduled reminders |
| Real email / SMS / push | NFR-6 OTP, DR-20, C-9 | Any real delivery channel or provider | Dummy APIs only; sign-in OTP uses the Dummy OTP service |
| Real OTP delivery | FR/NFR-6, story ACC-01 | A real SMS provider | Dummy OTP API (code visible in training inspection) |
| Real payment, payout, photo storage providers | FR-39..42, DUM stories | Real gateways | Dummy APIs (as planned) |

Rules while deferred: do not build the feature; if a story needs a small honest piece of it for the core journey, build only that and note it in the table with the story code; ask nothing, decide and log.

## Log

| Date | Item | Decision |
|---|---|---|
| 2026-10-29 | Recorded the list above | Owner instruction |
| 2026-10-30 | Seed loaders for owner, pet, provider, admin and pending application | Not deferred by choice: their tables do not exist yet. The seed files are validated now; the bolts that create the tables (004 accounts, 005 pets, 006 providers) must add the loader and call it from `apps/api/src/seed/run.ts`. |
| 2026-10-30 | Replanned the bolts: ACC-03 (notification port) out of bolt 004; ACC-04 (inbox) out of bolt 016; BKG-13 (booking chat) out of bolt 011 | Stories marked `deferred`, no longer assigned to a bolt. Other stories that mention notifications (BKG-09 timeout notice, BKG-12 18:00 reminder, ACU-02 owner notice) keep only their non-notification behaviour and show the state on the booking page. |
- BKG-07, BKG-08, BKG-09 (bolt 010): the owner notification when a request is confirmed, declined or times out. The owner sees the new state on the booking page instead.
- BKG-12 (bolt 011): the 18:00 reminder is a banner on Today and the booking page, not a notification. BKG-18: the chat section is not built.
- ACU-02 (bolt 015): the SMS-style owner notification for an acute event; the in-app banner is the notice. ACU-01: offline queueing of a concern report.
- ACC-05 (bolt 016): notification choices on the settings page and the rule that acute-event messages cannot be turned off.
- PET-07 (bolt 018): account closure with OTP re-verification to recover records, and the physical purge of expired booking-side records (updates, reviews, payments). Pets with no booking records can be deleted by the admin.
