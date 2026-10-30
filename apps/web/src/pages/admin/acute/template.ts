/** Edit an owner message template for future events. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  await apiFetch(`/admin/acute-templates/${String(form.get('language') ?? '')}`, {
    method: 'PUT',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: String(form.get('text') ?? '') }),
  }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: '/admin/acute' } });
};
