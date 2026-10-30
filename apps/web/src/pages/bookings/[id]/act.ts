/** Owner actions on a booking: confirm completion, ask to cancel a confirmed booking. The API decides. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const path =
    intent === 'confirm-completion'
      ? `/owner/bookings/${params.id}/confirm-completion`
      : intent === 'request-cancellation'
        ? `/owner/bookings/${params.id}/request-cancellation`
        : null;
  if (path)
    await apiFetch(path, {
      method: 'POST',
      cookie: request.headers.get('cookie'),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(
        intent === 'request-cancellation' ? { note: String(form.get('note') ?? '') } : {},
      ),
    }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: `/bookings/${params.id}` } });
};
