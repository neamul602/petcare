/** Server-side helpers shared by the pet pages. */
import { MESSAGE_KEYS, t, type Locale } from '@petcare/shared/i18n';

/** Every pets.* string, translated once on the server, for the form island. */
export function petText(locale: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of MESSAGE_KEYS) {
    if (key.startsWith('pets.')) out[key] = t(locale, key as Parameters<typeof t>[1]);
  }
  return out;
}

export const ageLabel = (locale: Locale, years: number) =>
  years < 1 ? t(locale, 'pets.age.under1') : t(locale, 'pets.age', { n: years });
