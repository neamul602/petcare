/** Owner and provider sign-out: ends the session on the API, clears the cookie, goes home. */
import type { APIRoute } from 'astro';
import { apiFetch, copyCookies } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers({ location: '/' });
  try {
    copyCookies(
      await apiFetch('/auth/sign-out', { method: 'POST', cookie: request.headers.get('cookie') }),
      headers,
    );
  } catch {
    headers.append('set-cookie', 'pc_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  }
  return new Response(null, { status: 303, headers });
};
