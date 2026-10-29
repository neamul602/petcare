/** Saves capacity for the chosen nights, then returns to the calendar with the outcome. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const from = String(form.get('from') ?? '');
  const back = (query: string) =>
    new Response(null, {
      status: 303,
      headers: { location: `/provider/calendar?from=${from}&${query}` },
    });
  const dates = form.getAll('dates').map(String);
  const capacity = Number(form.get('capacity'));
  const note = String(form.get('note') ?? '').trim();
  if (dates.length === 0 || !Number.isInteger(capacity)) return back('error=invalid');
  const response = await apiFetch('/provider/capacity', {
    method: 'PUT',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dates, capacity, ...(note ? { note } : {}) }),
  }).catch(() => null);
  if (response?.ok) return back('saved=1');
  const body = (await response?.json().catch(() => null)) as {
    error?: { code?: string; conflicts?: Array<{ date: string }> };
  } | null;
  if (body?.error?.code === 'capacity_below_booked')
    return back(
      `error=below&dates=${encodeURIComponent((body.error.conflicts ?? []).map((c) => c.date).join(', '))}`,
    );
  return back('error=invalid');
};
