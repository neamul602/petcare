---
stage: model-design
bolt: 009-booking-stay
created: 2026-10-30T20:00:00Z
---

## Model, design and decisions: booking request (bolt 009)

Stories: BKG-01 state machine, BKG-02 book pet, dates and care plan, BKG-03 review and submit with payment, BKG-04 owner waiting page. Approved under the owner's standing instruction.

### Domain model

- **Booking**: owner, provider, pet, a copy of the pet's details and care plan taken at submission, dates and nights, price per night and total, payment method, state, confirmation deadline, decline reason, submission key.
- **States (Step 24 decision)**: requested, authorized, captured (shown as Confirmed), in_stay, completed, declined, canceled, no_show, disputed, resolved, refunded. A timeout is canceled with trigger `confirmation_timeout`. Open question Q-S1 (owner never confirms completion) is decided in bolt 013: the admin can complete after the end date.
- **Transition log**: every change in the append-only log with from, to, trigger, actor and time.

### Design

- `packages/shared/src/bookings.ts`: allowed transitions and one pill name per state, so owner, provider and admin see the same pill.
- `transitionBooking` is the only code that changes state; it checks the transition and updates with a WHERE on the old state, so two racing changes cannot both win.
- Submit order: reserve every night, place the hold, create the booking. A failure gives back what was taken. A full night is refused before any charge.
- One submission key per checkout; the booking id is derived from owner and key, so a double tap or a resend is the same booking, the same hold and the same reservation. An in-process lock serialises twin requests and the database keeps a unique key as a backstop.
- Decline is final for a reference, so the screen starts a new key after a decline.
- The confirmation deadline uses the base 24 h window; the 12 h peak window comes with peak windows (bolt 019).
- Offline: the review step holds the request and sends it once when the connection returns; inputs live on the device.
- Services are not offered in v1 because no service data exists; the care plan is the pet's saved plan plus free-text instructions, screened for clinical wording.

### Screens

O5 Book (three steps, one island) and O6 Booking (state-driven, waiting and canceled shown now; confirmed, declined and later states fill in with bolts 010-013).
