/** "23 h 59 min" style remaining time, from whole minutes. */
import { t, type Locale } from '@petcare/shared/i18n';

export function remaining(locale: Locale, minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? t(locale, 'time.hm', { h, m }) : t(locale, 'time.m', { m });
}
