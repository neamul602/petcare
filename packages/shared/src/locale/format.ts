/**
 * One place for how numbers, money and dates look (UC-13, approved with bolt 001):
 * Latin digits with ৳ in both languages, lakh grouping, Bangla month names in Bangla.
 */
import type { Locale } from '../i18n/index.ts';
import { DHAKA_TIME_ZONE } from '../config/training-decisions.ts';

const NUMBER_LOCALE = 'en-IN';
const DATE_LOCALES: Record<Locale, string> = { bn: 'bn-BD-u-nu-latn', en: 'en-GB' };
const POISHA_PER_TAKA = 100;

/** Format an amount held in poisha (minor units) as taka, for example 2000000 -> "৳20,000". */
export function formatMoney(amountMinor: number): string {
  if (!Number.isInteger(amountMinor)) {
    throw new TypeError('Money is stored as whole poisha');
  }
  const taka = amountMinor / POISHA_PER_TAKA;
  const hasPoisha = amountMinor % POISHA_PER_TAKA !== 0;
  const formatted = new Intl.NumberFormat(NUMBER_LOCALE, {
    minimumFractionDigits: hasPoisha ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(taka));
  return `${amountMinor < 0 ? '-' : ''}৳${formatted}`;
}

/** Format a count with Latin digits and lakh grouping. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat(NUMBER_LOCALE).format(value);
}

/** Format a calendar date in Dhaka time: "28 Mar 2026" in English, "28 মার্চ, 2026" in Bangla. */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: DHAKA_TIME_ZONE,
  }).format(date);
}

/** Format a time of day in Dhaka time, 24-hour clock. */
export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: DHAKA_TIME_ZONE,
  }).format(date);
}
