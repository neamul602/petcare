/**
 * The single home of every business-rule value (memory-bank/standards/training-decisions.md).
 * Training values approved by the project owner; no other file may repeat them
 * (enforced by scripts/check-config-literals.mjs). Change the standard first, then this file.
 */

export const DHAKA_TIME_ZONE = 'Asia/Dhaka';

export const trainingDecisions = Object.freeze({
  /** TD-1: provider must answer within this window; shorter inside a documented peak window. */
  confirmationWindow: { baseMinutes: 1440, peakMinutes: 720 },
  /** TD-2: owner may report a problem until this long after completion. */
  disputeWindowMinutes: 4320,
  /** TD-3: weekly payout batch (0 = Sunday), only for bookings past the dispute window. */
  payoutBatch: { dayOfWeek: 0, localTime: '10:00', timeZone: DHAKA_TIME_ZONE },
  /** TD-4: refunds are chosen by the admin, up to the captured amount, with a rationale. */
  refunds: { mode: 'admin-discretion', maxIsCapturedAmount: true, rationaleRequired: true },
  /** TD-5: every booking, including Book again, gets its own authorization. */
  authorizationExtension: false,
  /** TD-6: cancellation and no-show paths (conservative, mostly manual). */
  cancellation: {
    ownerBeforeConfirmation: 'release-in-full',
    ownerAfterConfirmation: 'cancellation-request-to-admin',
    providerAfterConfirmation: 'admin-reassigns-or-full-refund',
    ownerNoShow: 'admin-decides',
    providerNoShow: 'admin-reassigns-or-full-refund',
  },
  /** TD-7: payment methods in display order; card is offered but never the default. */
  paymentMethods: ['bkash', 'nagad', 'card'],
  /** TD-8: commission in basis points, fixed on the booking at confirmation. */
  commissionBasisPoints: { tierA: 1000, tierAPeak: 800, tierB: 1600 },
  /** TD-9: the six PRD seed decline reasons (one required). */
  declineReasons: [
    'cannot-administer-medication',
    'cannot-accommodate-high-anxiety',
    'cannot-support-senior-limited-mobility',
    'care-requirements-exceed-capacity',
    'facility-not-suitable',
    'generic-decline',
  ],
  /** TD-10: utilization thresholds (booked nights / capacity nights, trailing 30 days). */
  reengagement: {
    trailingDays: 30,
    checkpoints: [
      { dayAfterApproval: 30, belowPercent: 40, action: 'soft-outreach' },
      { dayAfterApproval: 60, belowPercent: 30, action: 'active-outreach' },
      { dayAfterApproval: 90, belowPercent: 20, action: 'review-for-suspension' },
    ],
  },
  /** TD-11: one daily-update reminder, not provider-configurable. */
  dailyUpdateReminder: {
    localTime: '18:00',
    timeZone: DHAKA_TIME_ZONE,
    providerConfigurable: false,
  },
  /** TD-12: a confirmed stay not started by this local time on its start date is flagged. */
  stayStartDeadline: { localTime: '12:00', timeZone: DHAKA_TIME_ZONE },
  /** TD-13: report-a-problem categories. */
  reportCategories: [
    'care-not-as-agreed',
    'pet-health-concern',
    'communication',
    'facility-or-cleanliness',
    'safety-concern',
    'other',
  ],
  /** TD-14: acute-event severities (informational only). */
  acuteSeverities: ['minor', 'serious', 'critical'],
  /** TD-15: in-stay updates are photo and short note only. */
  updateMedia: { photo: true, note: true, video: false },
  /** TD-16: gateway fees are absorbed by the platform and not modelled. */
  gatewayFeesModelled: false,
} as const);

/** Platform rules fixed by the PRD and approved analysis (not training decisions, but still single-sourced). */
export const platformRules = Object.freeze({
  /** FR-13: launch neighbourhoods only. */
  launchNeighbourhoods: ['gulshan', 'banani', 'baridhara'],
  /** FR-6 and PRD §5: dogs and cats only. */
  species: ['dog', 'cat'],
  /** FR-38: operating ceiling; near-ceiling banner from 80 percent (UC-2). */
  operatingCeiling: {
    admins: 1,
    activeProviders: 25,
    completedBookingsPer30Days: 75,
    nearPercent: 80,
  },
  /** FR-10: minimum retention after the last booking. */
  retentionMonths: 24,
  /** Sign-in rules (bolt 004): sessions, resend limit. Not training decisions, but kept in one place. */
  auth: {
    userSessionDays: 14,
    adminSessionHours: 12,
    signupTokenMinutes: 10,
    otpSendLimit: { max: 5, windowMinutes: 10 },
    resendAfterSeconds: 60,
  },
  /** FR-11: curated shortlist size. */
  shortlist: { min: 3, max: 5 },
} as const);

export type TrainingDecisions = typeof trainingDecisions;
export type PlatformRules = typeof platformRules;
