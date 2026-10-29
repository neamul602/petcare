/** Admin sign-out: ends the admin session (audited by the API), clears the cookie, back to the admin sign-in. */
import type { APIRoute } from 'astro';
import { apiFetch, copyCookies } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers({ location: '/admin/sign-in' });
  try {
    copyCookies(
      await apiFetch('/admin/auth/sign-out', {
        method: 'POST',
        cookie: request.headers.get('cookie'),
      }),
      headers,
    );
  } catch {
    headers.append('set-cookie', 'pc_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  }
  return new Response(null, { status: 303, headers });
};
