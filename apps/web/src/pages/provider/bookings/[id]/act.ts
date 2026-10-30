/** Confirm or decline a request. The API decides; we return to the request with the outcome. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const base = `/provider/bookings/${params.id}`;
  const go = (query = '') =>
    new Response(null, { status: 303, headers: { location: base + query } });
  const send = (path: string, body?: unknown) =>
    apiFetch(path, {
      method: 'POST',
      cookie: request.headers.get('cookie'),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    }).catch(() => null);

  const response =
    intent === 'confirm'
      ? await send(`/provider/bookings/${params.id}/confirm`)
      : intent === 'start'
        ? await send(`/provider/bookings/${params.id}/start`)
        : intent === 'complete'
          ? await send(`/provider/bookings/${params.id}/complete`)
          : intent === 'cancel'
            ? await send(`/provider/bookings/${params.id}/cancel`, {
                note: String(form.get('note') ?? ''),
              })
            : intent === 'no-show'
              ? await send(`/provider/bookings/${params.id}/no-show`, {})
              : intent === 'decline'
                ? await send(`/provider/bookings/${params.id}/decline`, {
                    reason: String(form.get('reason') ?? ''),
                  })
                : null;
  if (response?.ok) return go();
  const code = ((await response?.json().catch(() => null)) as { error?: { code?: string } } | null)
    ?.error?.code;
  return go(`?error=${encodeURIComponent(code ?? 'generic')}`);
};
