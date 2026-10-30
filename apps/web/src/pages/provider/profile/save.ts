/** Saves the provider's profile; the API checks every field. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const response = await apiFetch('/provider/profile', {
    method: 'PUT',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      experience: {
        en: String(form.get('experienceEn') ?? ''),
        bn: String(form.get('experienceBn') ?? ''),
      },
      pricePerNightPoisha: Math.round(Number(form.get('priceTaka')) * 100),
      species: form.getAll('species').map(String),
      capabilities: form.getAll('capabilities').map(String),
      capacitySmall: Number(form.get('capacitySmall')),
    }),
  }).catch(() => null);
  return new Response(null, {
    status: 303,
    headers: { location: `/provider/profile?${response?.ok ? 'saved=1' : 'failed=1'}` },
  });
};
