/** Expand capacity for a whole peak window in one action. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const from = String(form.get('from') ?? '');
  const response = await apiFetch('/provider/capacity/expand-peak', {
    method: 'POST',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      windowId: String(form.get('windowId') ?? ''),
      capacity: Number(form.get('capacity')),
    }),
  }).catch(() => null);
  const body = response?.ok ? ((await response.json()) as { nights: number }) : null;
  return new Response(null, {
    status: 303,
    headers: {
      location: `/provider/calendar?from=${from}&${body ? `peak=${body.nights}` : 'error=peak'}`,
    },
  });
};
