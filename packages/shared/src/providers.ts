/** Provider tiers, status lifecycle and capability flags (FR-1, FR-2). Shared by the API and the screens. */
export const TIERS = ['A', 'B'] as const;
export type Tier = (typeof TIERS)[number];

export const PROVIDER_STATUSES = [
  'applied',
  'vetting',
  'approved',
  'suspended',
  'removed',
] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

/** applied -> vetting -> approved; from approved only suspended or removed. A suspended provider can be reinstated or removed. */
const NEXT: Record<ProviderStatus, readonly ProviderStatus[]> = {
  applied: ['vetting', 'removed'],
  vetting: ['approved', 'removed'],
  approved: ['suspended', 'removed'],
  suspended: ['approved', 'removed'],
  removed: [],
};

export const canMoveStatus = (from: ProviderStatus, to: ProviderStatus) => NEXT[from].includes(to);
export const nextStatuses = (from: ProviderStatus) => NEXT[from];

/** Only an approved provider is ever shown to owners or can take requests and confirmations. */
export const isBookable = (status: ProviderStatus) => status === 'approved';

export const CAPABILITIES = [
  'senior-pets',
  'medication-administration',
  'anxious-pets',
  'large-yard',
  'cats-only',
] as const;
