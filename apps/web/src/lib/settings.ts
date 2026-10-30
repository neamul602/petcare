/** Shared by the owner and provider settings pages and their save endpoints. */
import type { APIContext } from 'astro';
import { LOCALE_COOKIE, resolveLocale } from '@petcare/shared/i18n';
import { apiFetch } from './api';

export async function loadSettings(cookie: string | null) {
  const response = await apiFetch('/me/settings', { cookie }).catch(() => null);
  return response?.ok
    ? (
        (await response.json()) as {
          settings: { name: string; phone: string; language: 'bn' | 'en' };
        }
      ).settings
    : null;
}

/** Saves name and language, makes the chosen language the current one, and returns to the settings page. */
export async function saveSettings({ request, cookies }: APIContext, page: string) {
  const form = await request.formData();
  const language = resolveLocale(form.get('language'));
  const response = await apiFetch('/me/settings', {
    method: 'PUT',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: String(form.get('name') ?? ''), language }),
  }).catch(() => null);
  if (response?.ok)
    cookies.set(LOCALE_COOKIE, language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    });
  return new Response(null, {
    status: 303,
    headers: { location: `${page}?${response?.ok ? 'saved=1' : 'failed=1'}` },
  });
}
