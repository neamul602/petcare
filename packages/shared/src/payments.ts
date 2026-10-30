/** Payment methods and money helpers shared by the API and the screens. Amounts are whole poisha (BDT x 100). */
import { trainingDecisions } from './config/training-decisions.ts';
import type { Tier } from './providers.ts';

/** bKash and Nagad are offered first, card second (TD-7). */
export const PAYMENT_METHODS = ['bkash', 'nagad', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** The total for a stay: price per night times nights. BDT 2,500 x 8 nights = 2,000,000 poisha (BDT 20,000). */
export function stayTotalPoisha(pricePerNightPoisha: number, nights: number): number {
  if (!Number.isInteger(pricePerNightPoisha) || pricePerNightPoisha <= 0)
    throw new RangeError('Price must be whole poisha above zero');
  if (!Number.isInteger(nights) || nights <= 0) throw new RangeError('Nights must be at least 1');
  return pricePerNightPoisha * nights;
}

/** TD-8: Tier-A 10 %, Tier-A inside a peak window 8 %, Tier-B 16 %. Fixed on the booking when the provider confirms. */
export function commissionBasisPoints(tier: Tier, inPeakWindow = false): number {
  const rates = trainingDecisions.commissionBasisPoints;
  if (tier === 'B') return rates.tierB;
  return inPeakWindow ? rates.tierAPeak : rates.tierA;
}

/** The commission on an amount, in whole poisha (rounded to the nearest poisha). */
export function commissionOn(grossPoisha: number, basisPoints: number): number {
  return Math.round((grossPoisha * basisPoints) / 10_000);
}

/** What the provider receives: captured amount minus commission. BDT 20,000 at 10 % gives BDT 18,000. */
export function netPayoutPoisha(grossPoisha: number, basisPoints: number): number {
  return grossPoisha - commissionOn(grossPoisha, basisPoints);
}
