---
stage: model-design
bolt: 010-booking-stay
created: 2026-10-31T09:00:00Z
---

## Model, design and decisions: provider decision (bolt 010)

Stories: BKG-05 Today and Bookings, BKG-06 request view, BKG-07 confirm, BKG-08 decline with a reason, BKG-09 confirmation-window timeout. Approved under the owner's standing instruction. The owner notification in these stories is deferred (see `deferred-scope.md`): the owner sees the new state on the booking page.

### Design

- **One lock per booking** (`bookings/lock.ts`) wraps every state-changing operation (submit, owner cancel, confirm, decline, timeout), and `transitionBooking` still updates only from the expected old state. The first action wins and there is never a double outcome.
- **Confirm**: under the lock, the booking must be authorized and inside its deadline; the payment is captured (once, by idempotency key); only then the booking moves to captured. A failed capture leaves the booking waiting and returns a retry error.
- **Decline**: exactly six reasons (TD-9), no free text, validated by an enum. The booking moves to declined with the reason, nights and hold are released, and the pet's care history records the decline.
- **Timeout**: `processTimeouts` closes every authorized booking past its deadline as canceled with trigger `confirmation_timeout`, releases nights and hold, and writes an audit entry the admin queue shows later. It runs from a one-minute timer in the server and from tests with the injectable clock.
- **Pet access** becomes real: a provider may open a pet's care summary when that pet has a request with them (authorized, confirmed, in stay or completed).
- **Provider screens**: Today (waiting requests with time left, stays in progress), Bookings (requests, upcoming, in stay, past), a state-driven booking page whose request view shows dates, price, the pet copy, care plan, care summary, prior stays with the provider, and Confirm (primary) and Decline (a sheet with the six reasons).
