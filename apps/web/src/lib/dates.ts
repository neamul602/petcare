/** Date helpers for the screens. Dates are "YYYY-MM-DD" strings in Dhaka time. */
import { DHAKA_TIME_ZONE } from '@petcare/shared/config';

export function todayInDhaka(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
