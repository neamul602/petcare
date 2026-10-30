/** The booking state machine (FR-14) and the state pill each state uses. One model for owner, provider and admin. */
export const BOOKING_STATES = [
  'requested',
  'authorized',
  'captured',
  'in_stay',
  'completed',
  'declined',
  'canceled',
  'no_show',
  'disputed',
  'resolved',
  'refunded',
] as const;
export type BookingState = (typeof BOOKING_STATES)[number];

/** Allowed transitions. Anything else is rejected. "captured" is shown to people as Confirmed. */
const NEXT: Record<BookingState, readonly BookingState[]> = {
  requested: ['authorized', 'canceled'],
  authorized: ['captured', 'declined', 'canceled'],
  captured: ['in_stay', 'canceled', 'no_show'],
  in_stay: ['completed', 'disputed'],
  completed: ['disputed'],
  declined: [],
  canceled: [],
  no_show: ['refunded', 'disputed'],
  disputed: ['resolved', 'refunded'],
  resolved: ['refunded'],
  refunded: [],
};

export const canTransition = (from: BookingState, to: BookingState) => NEXT[from].includes(to);
export const nextStates = (from: BookingState) => NEXT[from];

export type PillState =
  | 'requested'
  | 'authorized'
  | 'captured'
  | 'in-stay'
  | 'completed'
  | 'declined'
  | 'canceled'
  | 'no-show'
  | 'disputed'
  | 'resolved'
  | 'refunded';

export const pillFor = (state: BookingState): PillState => state.replace('_', '-') as PillState;

/** The ways a booking can change state, written to the transition log. */
export type Trigger =
  | 'owner_submitted'
  | 'owner_canceled'
  | 'provider_confirmed'
  | 'provider_declined'
  | 'confirmation_timeout'
  | 'stay_started'
  | 'provider_completed'
  | 'owner_confirmed'
  | 'provider_flagged_no_show'
  | 'owner_reported'
  | 'admin_action';
