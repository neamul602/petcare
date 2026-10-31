/** Admin decisions on a booking's open items. The API decides; the page shows the result. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const form = await request.formData();
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const amount = Number(form.get('amountPoisha'));
  const id = params.id;
  const call = (path: string, body: unknown) =>
    apiFetch(path, {
      method: 'POST',
      cookie: request.headers.get('cookie'),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
  const intent = text('intent');
  const response =
    intent === 'cancellation'
      ? await call(`/admin/bookings/${id}/resolve-cancellation`, {
          decision: text('decision'),
          note: text('note'),
          ...(amount > 0 ? { amountPoisha: amount } : {}),
        })
      : intent === 'no-show'
        ? await call(`/admin/bookings/${id}/resolve-no-show`, {
            decision: text('decision'),
            rationale: text('rationale'),
          })
        : intent === 'flag'
          ? await call(`/admin/flags/${text('flagId')}/resolve`, { note: text('note') })
          : intent === 'complete'
            ? await call(`/admin/bookings/${id}/complete`, { reason: text('reason') })
            : null;
  return new Response(null, {
    status: 303,
    headers: { location: `/admin/bookings/${id}${response?.ok ? '' : '?error=1'}` },
  });
};
