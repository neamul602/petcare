/** Payment methods and money helpers shared by the API and the screens. Amounts are whole poisha (BDT x 100). */
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
