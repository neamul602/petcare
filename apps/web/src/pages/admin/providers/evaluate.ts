/** "Evaluate now": recompute provider flags (for demos). */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  await apiFetch('/admin/providers-health/evaluate', {
    method: 'POST',
    cookie: request.headers.get('cookie'),
  }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: '/admin/providers' } });
};
