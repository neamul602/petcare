/** Admin provider forms (create, change status, change tier). Plain form posts: the API decides, we show the outcome. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const cookie = request.headers.get('cookie');
  const id = text('id');
  const send = (path: string, body: unknown) =>
    apiFetch(path, {
      method: 'POST',
      cookie,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);

  const back = (location: string) => new Response(null, { status: 303, headers: { location } });
  const fail = async (response: Response | null, location: string) => {
    const code =
      ((await response?.json().catch(() => null)) as { error?: { code?: string } } | null)?.error
        ?.code ?? 'generic';
    return back(`${location}?error=${encodeURIComponent(code)}`);
  };

  switch (text('intent')) {
    case 'create': {
      const response = await send('/admin/providers', {
        name: { en: text('nameEn'), bn: text('nameBn') },
        tier: text('tier'),
        neighbourhood: text('area'),
        species: form.getAll('species').map(String),
      });
      if (response?.status === 201) {
        const { provider } = (await response.json()) as { provider: { id: string } };
        return back(`/admin/providers/${provider.id}`);
      }
      return fail(response, '/admin/providers');
    }
    case 'status': {
      const response = await send(`/admin/providers/${id}/status`, {
        to: text('to'),
        reason: text('reason'),
      });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'tier': {
      const response = await send(`/admin/providers/${id}/tier`, {
        tier: text('tier'),
        reason: text('reason'),
      });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    default:
      return back('/admin/providers');
  }
};
