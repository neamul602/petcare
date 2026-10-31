# STEP 35: Failure scenarios

Every row below is covered by an automated test that passed in the final run (439 unit and API tests, 262 browser tests; see `STEP-34-*`). The Dummy services are switched into `down`, `timeout`, `decline` or `ambiguous` mode to cause each failure.

| Scenario | Expected | Actual | Pass | Proven by |
|----------|----------|--------|------|-----------|
| Payment gateway unavailable | Safe failure, no booking created, retry possible | Submit returns "payment service not available, nothing was charged"; no booking, hold or reserved night is left; the same submission works once the gateway is back, with exactly one hold | Yes | `bookings.integration.test.ts` (gateway down), `payment-failures.spec.ts` |
| Payment declined | Clear message, booking not submitted | Plain Bangla message "payment method was declined, try another method"; no booking; nights freed; the screen starts a new reference for the next try | Yes | `bookings.integration.test.ts`, `payment-failures.spec.ts` |
| Capture answer lost | Retry captures once, never twice | A lost reply is asked again with the same key; the gateway shows one capture; a repeated confirm is "already confirmed" | Yes | `payments.integration.test.ts`, `decision.integration.test.ts` (lost reply during capture) |
| Capacity full on one night | Request blocked at submission | "Not free on: <date>" before continuing; if a night fills later, submit is refused with nothing charged or reserved; six simultaneous requests for the last slot give exactly one winner | Yes | `capacity.integration.test.ts`, `bookings.integration.test.ts`, `booking.spec.ts` |
| Provider does not answer in time | Authorization released, owner told | At 24 h (12 h in a peak window) the request is closed, nights and hold released, an admin audit signal is written; the owner sees "did not answer in time, nothing was charged" on the booking page. The notification message itself is deferred (see `memory-bank/deferred-scope.md`) | Yes (page notice; push notice deferred) | `decision.integration.test.ts` (timeout), `peak.integration.test.ts` |
| OTP service unavailable | Sign-in fails safely, retry possible | "The code service is not available" message, nothing created, works again after recovery | Yes | `auth.spec.ts` (code service down), `auth.integration.test.ts` |
| Photo upload on lost connection | Queued and retried | A failed photo upload shows the reason and a Try again button and never loses the saved pet; a daily update posted while offline is held on the page and posted when the connection returns. Automatic queueing of a photo across a page reload is not built, and the offline hold has no browser test | Partly | `pets.integration.test.ts` (storage down, timeout), `stay.integration.test.ts` (storage down saves nothing) |
| Payout service unavailable | Payout stays queued, no double payout | Batch fails, payouts stay queued, the next run pays each once; a lost reply with the same batch key never pays twice | Yes | `payouts.integration.test.ts` |
| Report outside the dispute window | Refused with reason | 72 h after completion the report is refused with "the time to report a problem has passed" and the booking page says so | Yes | `reviews.integration.test.ts` |
| Review before completion / second review | Refused | A review before completion is refused ("review once it is completed"); a second review on the same booking is refused | Yes | `reviews.integration.test.ts` |
| Clinical care requested | Rejected at intake | A declared clinical stay is stopped in the Book flow with "PetCare is boarding, not a clinic"; doubtful wording asks for a confirmation; the API refuses both | Yes | `pets.integration.test.ts`, `bookings.integration.test.ts`, `booking.spec.ts` |

## Extra failure paths covered

- Gateway down at release: the release stays pending, the admin sees it, and a retry finishes it (`payments.integration.test.ts`, `completion.integration.test.ts`).
- Admin refund while the payment service is down: nothing changes and it can be retried (`payouts.integration.test.ts`).
- Confirm racing the last second of the window: one outcome only (`decision.integration.test.ts`).
- Illegal booking transitions are rejected; two racing changes cannot both win (`bookings.integration.test.ts`).
