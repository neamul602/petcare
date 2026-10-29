/** Reads the visitor's language from the pc_locale cookie (Bangla when absent). */
import type { AstroCookies } from 'astro';
import { LOCALE_COOKIE, resolveLocale, type Locale } from '@petcare/shared/i18n';

export function getLocale(cookies: AstroCookies): Locale {
  return resolveLocale(cookies.get(LOCALE_COOKIE)?.value);
}

/** Only same-site paths may be used as the return address after switching language. */
export function safeReturnPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
