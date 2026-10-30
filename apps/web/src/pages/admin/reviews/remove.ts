/** Admin removes a review for cause; the API records the reason. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  await apiFetch(`/admin/reviews/${String(form.get('id') ?? '')}/remove`, {
    method: 'POST',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reason: String(form.get('reason') ?? '') }),
  }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: '/admin/reviews' } });
};
