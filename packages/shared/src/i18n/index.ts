/**
 * Minimal typed translation helper. Owner and provider surfaces use Bangla by default
 * with English parity (FR-47); the admin console uses its own English-only catalog (NFR-13).
 */
import adminEn from './admin-en.json';
import bn from './bn.json';
import en from './en.json';

export const LOCALES = ['bn', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'bn';
export const LOCALE_COOKIE = 'pc_locale';

export type MessageKey = keyof typeof en;
export type AdminMessageKey = keyof typeof adminEn;

const catalogs: Record<Locale, Record<MessageKey, string>> = { bn, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Resolve a cookie or header value to a supported locale, defaulting to Bangla. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Translate an owner or provider string. Missing keys are a build failure (check-i18n), never silent. */
export function t(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const message = catalogs[locale][key];
  if (message === undefined) {
    throw new Error(`Missing ${locale} message for "${key}"`);
  }
  return interpolate(message, params);
}

/** Translate an admin console string (English only). */
export function ta(key: AdminMessageKey, params?: Record<string, string | number>): string {
  return interpolate(adminEn[key], params);
}
