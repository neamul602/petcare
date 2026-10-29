/** Translate every message whose key starts with one of the prefixes, once on the server, for an island. */
import { MESSAGE_KEYS, t, type Locale, type MessageKey } from '@petcare/shared/i18n';

export function textFor(locale: Locale, ...prefixes: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of MESSAGE_KEYS) {
    if (prefixes.some((p) => key.startsWith(p))) out[key] = t(locale, key as MessageKey);
  }
  return out;
}
