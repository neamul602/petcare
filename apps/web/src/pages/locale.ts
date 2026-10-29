/** Switches the language cookie and returns to the same page (owner and provider surfaces). */
import type { APIRoute } from 'astro';
import { LOCALE_COOKIE, resolveLocale } from '@petcare/shared/i18n';
import { safeReturnPath } from '@/lib/locale';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const locale = resolveLocale(url.searchParams.get('to'));
  cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
    httpOnly: false,
  });
  return redirect(safeReturnPath(url.searchParams.get('back')), 303);
};
