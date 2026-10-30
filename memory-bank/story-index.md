# Global Story Index

Intent `001-petcare-v1`: **76 stories** in 11 units (generated 2026-10-29T16:00:00Z). Status markers: no marker = planned, ✅ GENERATED = file created, ✅ COMPLETED = implemented.

## Coverage

- Every in-scope FR (FR-1..FR-50), every derived requirement (DR-1..DR-22), every Dummy behaviour (TR-1..TR-8), all 24 blueprint screens and all 43 page specs are referenced by at least one story (script-checked).
- No story depends on a story in a later unit (script-checked).

## Journeys

| Journey | Stories (in order) |
|---|---|
| UJ-1 first booking | ACC-01, PET-01, PET-02, PET-03, SRC-05, SRC-04, SUP-04, BKG-02, BKG-03, PAY-01, BKG-04, BKG-06, BKG-07, PAY-02, BKG-10, BKG-12, BKG-13, BKG-14, BKG-18, ACU-01, ACU-02, BKG-15, PAY-04, REV-01, REV-02, REV-05 |
| UJ-2 provider Eid capacity | SRC-01, SRC-02, BKG-05, BKG-06, BKG-07, BKG-08, BKG-12, PAY-04, PAY-05, PAY-07, REV-04, ADM-04 |
| UJ-3 admin at the ceiling | ACC-02, ADM-01, ACU-03, ACU-04, REV-06, PAY-06, REV-03, SUP-02, ADM-02, ADM-03, ADM-04, ADM-05 |
| UJ-4 book again | SRC-05, BKG-17, BKG-16, PET-05, PET-06, BKG-06, BKG-07, PAY-01, PAY-02 |

## 001-platform-foundation

### 001-workspace-and-app-shell.md ✅ COMPLETED
**FND-01** Workspace and app shell · must · all

### 002-design-tokens-and-ui-kit.md ✅ COMPLETED
**FND-02** Design tokens and UI kit · must · all

### 003-bangla-and-english-with-parity.md ✅ COMPLETED
**FND-03** Bangla and English with parity · must · UJ-1, UJ-2, UJ-4

### 004-pwa-offline-and-shared-states.md ✅ COMPLETED
**FND-04** PWA, offline and shared states · must · all

### 005-configuration-clock-and-log-primitives.md ✅ COMPLETED
**FND-05** Configuration, clock and log primitives · must · all

### 006-performance-and-accessibility-checks.md ✅ COMPLETED
**FND-06** Performance and accessibility checks · should · all

### 007-training-scenario-seed.md ✅ COMPLETED
**FND-07** Training scenario seed · must · all

## 002-dummy-integration-services

### 001-dummy-service-host-and-training-controls.md ✅ COMPLETED
**DUM-01** Dummy service host and training controls · must · all

### 002-dummy-sms-otp-api.md ✅ COMPLETED
**DUM-02** Dummy SMS / OTP API · must · UJ-1

### 003-dummy-payment-gateway-api.md ✅ COMPLETED
**DUM-03** Dummy payment gateway API · must · UJ-1, UJ-4

### 004-dummy-mfs-payout-api.md ✅ COMPLETED
**DUM-04** Dummy MFS payout API · must · UJ-2

### 005-dummy-notification-and-photo-apis.md ✅ COMPLETED
**DUM-05** Dummy notification and photo APIs · must · UJ-1

## 003-accounts-notifications

### 001-sign-in-with-phone-otp.md ✅ COMPLETED
**ACC-01** Sign in with phone OTP · must · UJ-1

### 002-admin-sign-in-and-role-guards.md ✅ COMPLETED
**ACC-02** Admin sign-in and role guards · must · UJ-3

### 003-notification-port-and-delivery.md ✅ GENERATED
**ACC-03** Notification port and delivery · must · all

### 004-inbox.md ✅ GENERATED
**ACC-04** Inbox · should · UJ-1

### 005-settings.md ✅ GENERATED
**ACC-05** Settings · should · none

## 004-pet-care-profile

### 001-create-and-edit-a-pet-profile.md ✅ COMPLETED
**PET-01** Create and edit a pet profile · must · UJ-1

### 002-structured-care-plan.md ✅ COMPLETED
**PET-02** Structured care plan · must · UJ-1

### 003-reject-clinical-requests-at-intake.md ✅ COMPLETED
**PET-03** Reject clinical requests at intake · must · UJ-1

### 004-pet-page-and-care-history.md ✅ COMPLETED
**PET-04** Pet page and care history · must · UJ-4

### 005-care-plan-pre-fill.md ✅ COMPLETED
**PET-05** Care plan pre-fill · must · UJ-4

### 006-provider-care-summary.md ✅ COMPLETED
**PET-06** Provider care summary · must · UJ-1, UJ-4

### 007-archive-and-retention.md ✅ GENERATED
**PET-07** Archive and retention · should · none

## 005-provider-supply-vetting

### 001-provider-records-tiers-and-status.md ✅ COMPLETED
**SUP-01** Provider records, tiers and status · must · UJ-2, UJ-3

### 002-application-review-and-vetting.md ✅ GENERATED
**SUP-02** Application review and vetting · must · UJ-3

### 003-appeal-and-bias-audit-data.md ✅ GENERATED
**SUP-03** Appeal and bias-audit data · should · UJ-3

### 004-public-provider-page.md ✅ COMPLETED
**SUP-04** Public provider page · must · UJ-1

### 005-provider-profile-editor.md ✅ GENERATED
**SUP-05** Provider profile editor · should · UJ-2

## 006-search-capacity

### 001-capacity-per-night.md ✅ COMPLETED
**SRC-01** Capacity per night · must · UJ-2

### 002-peak-window-capacity.md ✅ GENERATED
**SRC-02** Peak-window capacity · must · UJ-2

### 003-reserve-and-release-nights-safely.md ✅ COMPLETED
**SRC-03** Reserve and release nights safely · must · UJ-1

### 004-curated-shortlist.md ✅ COMPLETED
**SRC-04** Curated shortlist · must · UJ-1

### 005-home-and-search-entry.md ✅ COMPLETED
**SRC-05** Home and search entry · must · UJ-1, UJ-4

### 006-bookings-per-neighbourhood.md ✅ GENERATED
**SRC-06** Bookings per neighbourhood · should · UJ-3

## 007-payments-payouts

### 001-authorize-payment-at-request.md ✅ COMPLETED
**PAY-01** Authorize payment at request · must · UJ-1, UJ-4

### 002-capture-on-confirmation.md ✅ COMPLETED
**PAY-02** Capture on confirmation · must · UJ-1

### 003-release-authorization.md ✅ COMPLETED
**PAY-03** Release authorization · must · UJ-1

### 004-commission-and-payout-queue.md ✅ COMPLETED
**PAY-04** Commission and payout queue · must · UJ-1, UJ-2

### 005-weekly-payout-batch.md ✅ COMPLETED
**PAY-05** Weekly payout batch · must · UJ-2

### 006-freeze-release-and-refund.md ✅ COMPLETED
**PAY-06** Freeze, release and refund · must · UJ-3

### 007-provider-earnings.md ✅ GENERATED
**PAY-07** Provider earnings · should · UJ-2

### 008-admin-payouts-and-reconciliation.md ✅ GENERATED
**PAY-08** Admin payouts and reconciliation · should · UJ-3

## 008-booking-stay

### 001-booking-state-machine.md ✅ COMPLETED
**BKG-01** Booking state machine · must · all

### 002-book-pet-dates-and-care-plan.md ✅ COMPLETED
**BKG-02** Book: pet, dates and care plan · must · UJ-1

### 003-review-and-submit-with-payment.md ✅ COMPLETED
**BKG-03** Review and submit with payment · must · UJ-1, UJ-4

### 004-owner-booking-page-waiting.md ✅ COMPLETED
**BKG-04** Owner booking page: waiting · must · UJ-1

### 005-provider-today-and-bookings.md ✅ COMPLETED
**BKG-05** Provider Today and Bookings · must · UJ-2

### 006-provider-request-view.md ✅ COMPLETED
**BKG-06** Provider request view · must · UJ-1, UJ-2, UJ-4

### 007-confirm-a-request.md ✅ COMPLETED
**BKG-07** Confirm a request · must · UJ-1, UJ-2

### 008-decline-with-a-reason.md ✅ COMPLETED
**BKG-08** Decline with a reason · must · UJ-2

### 009-confirmation-window-timeout.md ✅ COMPLETED
**BKG-09** Confirmation-window timeout · must · UJ-1

### 010-start-the-stay.md ✅ COMPLETED
**BKG-10** Start the stay · must · UJ-1

### 011-cancellations-and-no-shows.md ✅ GENERATED
**BKG-11** Cancellations and no-shows · should · none

### 012-daily-updates.md ✅ COMPLETED
**BKG-12** Daily updates · must · UJ-1, UJ-2

### 013-booking-chat.md ✅ GENERATED
**BKG-13** Booking chat · must · UJ-1

### 014-vet-clinic-directory.md ✅ COMPLETED
**BKG-14** Vet-clinic directory · must · UJ-1

### 015-mark-complete-and-confirm-completion.md ✅ GENERATED
**BKG-15** Mark complete and confirm completion · must · UJ-1

### 016-book-again.md ✅ GENERATED
**BKG-16** Book again · must · UJ-4

### 017-owner-bookings-list.md ✅ GENERATED
**BKG-17** Owner bookings list · should · UJ-4

### 018-owner-booking-page-during-the-stay.md ✅ COMPLETED
**BKG-18** Owner booking page during the stay · must · UJ-1

## 009-reviews-disputes

### 001-leave-a-verified-review.md ✅ GENERATED
**REV-01** Leave a verified review · must · UJ-1

### 002-public-reviews-and-aggregates.md ✅ GENERATED
**REV-02** Public reviews and aggregates · must · UJ-1

### 003-moderate-reviews-for-cause.md ✅ GENERATED
**REV-03** Moderate reviews for cause · must · UJ-3

### 004-provider-care-record.md ✅ GENERATED
**REV-04** Provider care record · should · UJ-2

### 005-report-a-problem.md ✅ GENERATED
**REV-05** Report a problem · must · UJ-1

### 006-investigate-and-resolve-a-report.md ✅ GENERATED
**REV-06** Investigate and resolve a report · must · UJ-3

## 010-acute-event-response

### 001-report-a-concern.md ✅ GENERATED
**ACU-01** Report a concern · must · UJ-1

### 002-acute-event-effects-and-owner-notice.md ✅ GENERATED
**ACU-02** Acute-event effects and owner notice · must · UJ-1, UJ-3

### 003-runbook-coordination.md ✅ GENERATED
**ACU-03** Runbook coordination · must · UJ-3

### 004-close-with-a-post-mortem.md ✅ GENERATED
**ACU-04** Close with a post-mortem · must · UJ-3

## 011-admin-operations

### 001-urgency-queue.md ✅ GENERATED
**ADM-01** Urgency queue · must · UJ-3

### 002-audit-log.md ✅ GENERATED
**ADM-02** Audit log · must · UJ-3

### 003-operating-ceiling.md ✅ GENERATED
**ADM-03** Operating ceiling · should · UJ-3

### 004-provider-health-and-utilization.md ✅ GENERATED
**ADM-04** Provider health and utilization · should · UJ-2, UJ-3

### 005-defection-signals.md ✅ GENERATED
**ADM-05** Defection signals · should · UJ-4, UJ-3
