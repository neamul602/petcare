/** Archive a pet, then go back to the list. Past stays and history are kept by the API. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  await apiFetch(`/owner/pets/${params.id}/archive`, {
    method: 'POST',
    cookie: request.headers.get('cookie'),
  }).catch(() => null);
  return new Response(null, { status: 303, headers: { location: '/pets' } });
};
