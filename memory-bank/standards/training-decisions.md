# Training Decisions

Status: **APPROVED** (`APPROVE TRAINING DECISIONS`, 2026-10-28; all recommended values accepted by the project owner)
Clarified 2026-10-29: TD-6 wording (post-confirmation owner cancellation is a cancellation request, not a FR-24 report); values unchanged.

Intent: 001-petcare-v1. Resolves the PRD §9 open questions the software cannot run without (and five gaps found in Step 7).

These are **training values**: business decisions made by the project owner for the training build, not real PetCare policy and not claims about any real gateway. Each value lives in **one place in the code** (a single configuration module); no other file may hard-code it. A change to a value is a change to this file first.

| TD | Resolves | Decision |
|---|---|---|
| TD-1 | OQ-1 | **Confirmation window: 24 h; 12 h inside a documented peak window.** Authorization holds for the window. On expiry with no provider action: authorization released, booking closed as timed out, owner notified, admin timeout signal raised (DR-12). Scheduler clock is injectable so tests and demos can fast-forward. |
| TD-2 | OQ-2 | **Dispute window: 72 h after booking completion.** Reports outside the window are refused with a reason. An acute event opens the window early (FR-29). |
| TD-3 | OQ-3 | **Payout: weekly batch, Sunday 10:00 Asia/Dhaka,** including only bookings whose dispute window has closed and whose payout is not frozen. Admin has a "run batch now" action for demos. Payout is via the Dummy MFS Payout API. |
| TD-4 | OQ-4 | **Refunds: admin discretion.** Any amount from 0 up to the captured amount, rationale required, returned to the original payment method through the Dummy gateway. No fixed refund tiers. |
| TD-5 | OQ-5 | **No authorization extension.** Every booking, including Book again, creates its own authorization. |
| TD-6 | OQ-6 | **Cancellation and no-show path A (conservative, mostly manual).** Owner cancels before confirmation: authorization released in full. Owner cancels after confirmation: the owner sends a cancellation request that appears in the admin queue (this is not a FR-24 report, which only exists after completion); the admin decides any refund under TD-4, with no automatic refund. Provider cancels after confirmation: admin reassigns or gives a full refund. Owner no-show: admin decides. Provider no-show (stay-start SLA missed): admin reassigns or gives a full refund. `canceled` and `no-show` are booking states; every transition is logged (NFR-22). |
| TD-7 | OQ-7 | **Card is offered** through the Dummy gateway, listed after bKash and Nagad, never the default. PetCare never handles card data (NFR-9). |
| TD-8 | OQ-8 | **Commission: Tier-A 10 %, and 8 % for bookings in a documented peak window; Tier-B 16 %.** The rate is fixed on the booking at confirmation (static per booking, NFR-25). No time-based step-up. Worked example for BDT 20,000: Tier-A normal pays out 18,000; Tier-A peak 18,400; Tier-B 16,800. |
| TD-9 | OQ-10 | **Decline reasons: the six PRD seed reasons only:** cannot administer medication; cannot accommodate high-anxiety pets; cannot support senior/limited-mobility pets; care requirements exceed capacity; facility/environment not suitable; generic decline. Stored as data so extension needs no code change. Resolves conflict C-3 in favour of the PRD. |
| TD-10 | OQ-11 | **Re-engagement thresholds:** utilization below 40 % at day 30 (soft outreach), below 30 % at day 60 (active outreach), below 20 % at day 90 (review for suspension). Utilization = booked nights / nights of capacity offered, trailing 30 days, measured from provider approval. Admin has an "evaluate now" action. Never auto-suspends (FR-36). |
| TD-11 | OQ-12 | **Daily-update reminder: one per day at 18:00 Asia/Dhaka** if no update has been posted for an `in-stay` booking; not provider-configurable. Sent through the Dummy Notification API. Completion is never blocked by missed updates. |
| TD-12 | Q-D1 | **Stay-start SLA: 12:00 Asia/Dhaka on the start date.** If the provider has not started the stay by then, the booking is flagged to the admin (FR-18). |
| TD-13 | Q-D2 | **Report categories:** care not as agreed; pet health concern; communication; facility or cleanliness; safety concern; other. |
| TD-14 | Q-D3 | **Acute-event severity:** minor, serious, critical. Informational only; it does not change the flow. |
| TD-15 | Q-D4 | **In-stay updates are photo and short note only.** Short video is out of the training build. Photo upload retries on a lost connection. |
| TD-16 | Q-D5 | **Gateway fees are absorbed by the platform and not modelled.** The Dummy gateway charges no fees. |

## Not decided here (resolved in later steps)

- Booking-state naming conflicts C-7 and C-8 and the full state machine: Step 24.
- OQ-9, OQ-13, OQ-14, OQ-16, OQ-17, OQ-19, OQ-20, OQ-23..OQ-25: lighter decisions made in stories, per requirements §6.
- OQ-15, OQ-18, OQ-21, OQ-22: out of build scope.
