/** Calendar-date helpers. Dates are "YYYY-MM-DD" strings in Dhaka time; a stay's nights run from check-in up to the day before check-out. */
import type { Clock } from '@petcare/shared/clock';
import { DHAKA_TIME_ZONE } from '@petcare/shared/config';

export const MAX_STAY_NIGHTS = 30;
const SHAPE = /^\d{4}-\d{2}-\d{2}$/;

export function isCalendarDate(value: string): boolean {
  if (!SHAPE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today's date in Dhaka. */
export function dhakaToday(clock: Clock): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(clock.now());
}

/** The nights of a stay: check-in inclusive, check-out exclusive. */
export function nightsBetween(from: string, to: string): string[] {
  const nights: string[] = [];
  for (let d = from; d < to; d = addDays(d, 1)) nights.push(d);
  return nights;
}

export type WindowProblem = 'invalid_dates' | 'dates_in_past' | 'window_too_long';

/** Check-in must be today or later, check-out after check-in, at most MAX_STAY_NIGHTS nights. */
export function checkWindow(from: string, to: string, today: string): WindowProblem | null {
  if (!isCalendarDate(from) || !isCalendarDate(to) || to <= from) return 'invalid_dates';
  if (from < today) return 'dates_in_past';
  if (nightsBetween(from, to).length > MAX_STAY_NIGHTS) return 'window_too_long';
  return null;
}
