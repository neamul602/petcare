/**
 * Loads and validates the single business-rule configuration and runtime settings.
 * The API refuses to start if any value is missing or malformed.
 */
import { platformRules, trainingDecisions } from '@petcare/shared/config';
import { z } from 'zod';

const minutes = z.number().int().positive();
const localTime = z.string().regex(/^\d{2}:\d{2}$/);
const basisPoints = z.number().int().min(0).max(10_000);

const trainingDecisionsSchema = z.object({
  confirmationWindow: z.object({ baseMinutes: minutes, peakMinutes: minutes }),
  disputeWindowMinutes: minutes,
  payoutBatch: z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    localTime,
    timeZone: z.string(),
  }),
  refunds: z.object({
    mode: z.literal('admin-discretion'),
    maxIsCapturedAmount: z.boolean(),
    rationaleRequired: z.boolean(),
  }),
  authorizationExtension: z.boolean(),
  cancellation: z.object({
    ownerBeforeConfirmation: z.string(),
    ownerAfterConfirmation: z.string(),
    providerAfterConfirmation: z.string(),
    ownerNoShow: z.string(),
    providerNoShow: z.string(),
  }),
  paymentMethods: z.array(z.enum(['bkash', 'nagad', 'card'])).min(1),
  commissionBasisPoints: z.object({
    tierA: basisPoints,
    tierAPeak: basisPoints,
    tierB: basisPoints,
  }),
  declineReasons: z.array(z.string()).length(6),
  reengagement: z.object({
    trailingDays: z.number().int().positive(),
    checkpoints: z.array(
      z.object({
        dayAfterApproval: z.number().int().positive(),
        belowPercent: z.number().min(0).max(100),
        action: z.string(),
      }),
    ),
  }),
  dailyUpdateReminder: z.object({
    localTime,
    timeZone: z.string(),
    providerConfigurable: z.boolean(),
  }),
  stayStartDeadline: z.object({ localTime, timeZone: z.string() }),
  reportCategories: z.array(z.string()).min(1),
  acuteSeverities: z.array(z.string()).min(1),
  updateMedia: z.object({ photo: z.boolean(), note: z.boolean(), video: z.boolean() }),
  gatewayFeesModelled: z.boolean(),
});

const runtimeSchema = z.object({
  DATABASE_URL: z.string().url().default('postgres://petcare:petcare@localhost:5433/petcare'),
  API_PORT: z.coerce.number().int().positive().default(3000),
});

export type RuntimeConfig = z.infer<typeof runtimeSchema>;

/** Validate the business rules; throws with a readable message when something is missing. */
export function loadBusinessRules(source: unknown = trainingDecisions) {
  const parsed = trainingDecisionsSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid training decisions: ${z.prettifyError(parsed.error)}`);
  }
  return { trainingDecisions: parsed.data, platformRules };
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return runtimeSchema.parse(env);
}
