# PetCare v1: final demonstration guide (workbook Step 40)

Demonstrate the running product, not slides. Everything below uses training data only.

## Start it

```bash
nvm use 22
npm run db:up        # PostgreSQL on port 5433
npm run seed         # labelled training data: Bibi and Tito, four providers, Sadia's application, the admin
npm run dev          # web http://localhost:4321, API :3000, Dummy services :4100
```

The Dummy services have an inspection page for each service: `http://localhost:4100/_training/payments/inspect` (payment gateway), `.../otp/inspect` (sign-in codes), `.../payouts/inspect`, `.../photos/inspect`. Failure modes can be switched with `PUT /_training/<service>/failure-mode` and `{"mode":"down"|"timeout"|"decline"|"ambiguous"|"none"}`; `POST /_training/payouts/settle-now` pays queued payouts.

## Accounts (training only)

| Who | How to sign in |
|-----|----------------|
| Bibi (owner, with Tito) | `/sign-in`, phone `01712000001`; the code is shown by the OTP inspection page |
| Rashid (Tier-A provider) | `/sign-in`, phone `01712000002` |
| Farzana, Kamrul, Nusrat | `01712000003`, `01712000004`, `01712000005` |
| Ayaat (admin) | `/admin/sign-in`, `ayaat@petcare.training`, password from `ADMIN_TRAINING_PASSWORD` (default `training-admin-pass`) |

## The eleven parts

1. **Owner**: sign in as Bibi with the OTP; open Pets, then Tito: insulin 2 units at 08:00 and 20:00, diabetic, extra attention.
2. **Search**: Home, pick dates for the Eid window (as admin, add the window first under Insights, "Add peak window"); the shortlist shows each provider with the reason (tier, neighbourhood, free every night).
3. **Booking**: open Rashid's page, Book, choose Tito and 8 nights, continue, review BDT 20,000, pay with bKash, send the request. Open the payment inspection page: the authorization is held, not captured.
4. **Provider**: sign in as Rashid (second browser); Today shows the request with the time left; open it (Tito's care plan and history), Confirm. The inspection page now shows the capture; Earnings will show the commission and net.
5. **Capacity**: as Rashid open Calendar and set a night's room to 0 (closed); as Bibi a request over that night is blocked at step 1; then use "Expand for peak" to raise the Eid window.
6. **Stay**: Rashid starts the stay (on the start date), posts a daily update with a photo, and opens the vet clinics; Rashid reports a concern (acute event); as admin the Queue shows it first, open it and work the runbook, send the Bangla message; Bibi's booking page shows the banner and the message. Booking chat is not built.
7. **Completion**: Rashid marks the stay complete, Bibi confirms, Bibi leaves a verified review with a stay photo (it shows on Rashid's public page); Earnings shows the payout net of commission.
8. **Book again**: from Home tap Book again; the timer runs; submit. The timer is stored on the server (well under 4 minutes).
9. **Admin**: Bibi reports a problem on the completed stay (within 72 hours); the payout freezes; the admin opens the report and resolves it with a rationale and a refund; check Payouts (reconciliation), the Audit log and the operating ceiling on Insights.
10. **Language**: on any owner screen use the language button to switch Bangla and English.
11. **Automated test**: `npm run verify` then `npx playwright test`; the HTML report opens with `npx playwright show-report`. The recorded end-to-end journey is `evidence/STEP-34-e2e-video.mp4` (spec: `tests/e2e/journey.spec.ts`).

## Time

The running servers use the real clock, so the 24 hour confirmation window, the 72 hour dispute window and the weekly Sunday payout batch cannot be waited out live. They are proven with an injectable clock in the tests (`apps/api/src/**/*.integration.test.ts`). To demonstrate a stay that has "already happened", change the booking's dates in the database as `tests/e2e/journey.spec.ts` does, and use the admin "Run batch now" button for payouts.
