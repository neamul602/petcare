/** Admin provider forms (create, change status, change tier). Plain form posts: the API decides, we show the outcome. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const cookie = request.headers.get('cookie');
  const id = text('id');
  const send = (path: string, body: unknown, method: 'POST' | 'PUT' = 'POST') =>
    apiFetch(path, {
      method,
      cookie,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);

  const back = (location: string) => new Response(null, { status: 303, headers: { location } });
  const fail = async (response: Response | null, location: string) => {
    const error = (
      (await response?.json().catch(() => null)) as {
        error?: { code?: string; missing?: string[] };
      } | null
    )?.error;
    const missing = error?.missing?.length
      ? `&missing=${encodeURIComponent(error.missing.join(','))}`
      : '';
    return back(`${location}?error=${encodeURIComponent(error?.code ?? 'generic')}${missing}`);
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
    case 'vetting-save': {
      const response = await send(
        `/admin/providers/${id}/vetting`,
        {
          identityDone: form.get('identityDone') === 'on',
          addressDone: form.get('addressDone') === 'on',
          capabilityDone: form.get('capabilityDone') === 'on',
          referencesNote: text('referencesNote'),
          outreachNote: text('outreachNote'),
          artifacts: text('artifacts')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
        },
        'PUT',
      );
      return response?.ok
        ? back(`/admin/providers/${id}?saved=1`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'request-info': {
      const response = await send(`/admin/providers/${id}/request-info`, { note: text('note') });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'appeal': {
      const response = await send(`/admin/providers/${id}/appeals`, { note: text('note') });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'appeal-outcome': {
      const response = await send(
        `/admin/appeals/${text('appealId')}`,
        { outcome: text('outcome') },
        'PUT',
      );
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'outreach': {
      const response = await send(`/admin/providers/${id}/outreach`, {
        flag: text('flag'),
        outreach: text('outreach'),
        outcome: text('outcome'),
      });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    case 'signal': {
      const response = await send(`/admin/providers/${id}/signals`, {
        sourceType: text('sourceType'),
        ...(text('sourceId') ? { sourceId: text('sourceId') } : {}),
        note: text('note'),
      });
      return response?.ok
        ? back(`/admin/providers/${id}`)
        : fail(response, `/admin/providers/${id}`);
    }
    default:
      return back('/admin/providers');
  }
};
