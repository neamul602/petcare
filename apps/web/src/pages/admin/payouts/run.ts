/** Admin "Run batch now": same rules as the weekly run. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const response = await apiFetch('/admin/payouts/run-batch', {
    method: 'POST',
    cookie: request.headers.get('cookie'),
  }).catch(() => null);
  const body = response?.ok ? ((await response.json()) as { sent: number }) : null;
  return new Response(null, {
    status: 303,
    headers: { location: `/admin/payouts?ran=${body ? body.sent : 'failed'}` },
  });
};
