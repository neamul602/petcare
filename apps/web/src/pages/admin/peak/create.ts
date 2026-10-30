/** Admin adds a peak window; the API checks it. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  await apiFetch('/admin/peak-windows', {
    method: 'POST',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: String(form.get('name') ?? ''),
      startDate: String(form.get('startDate') ?? ''),
      endDate: String(form.get('endDate') ?? ''),
    }),
  }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: '/admin/insights' } });
};
