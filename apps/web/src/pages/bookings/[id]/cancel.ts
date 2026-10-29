/** Owner cancels a request the provider has not confirmed yet; the API gives back the nights and the hold. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const response = await apiFetch(`/owner/bookings/${params.id}/cancel`, {
    method: 'POST',
    cookie: request.headers.get('cookie'),
  }).catch(() => null);
  const pending =
    response?.ok &&
    ((await response.json().catch(() => ({}))) as { paymentPending?: boolean }).paymentPending;
  return new Response(null, {
    status: 303,
    headers: { location: `/bookings/${params.id}${pending ? '?pending=1' : ''}` },
  });
};
