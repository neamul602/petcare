/** Forwards /api/* to the PetCare API (same origin for the browser, cookies pass through untouched). */
import type { APIRoute } from 'astro';
import { API_URL } from '@/lib/api';

export const prerender = false;

const handle: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const target = `${API_URL}/${params.path ?? ''}${url.search}`;
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const headers: Record<string, string> = {};
  for (const name of ['cookie', 'content-type', 'accept-language']) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });
    const out = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) out.set('content-type', contentType);
    for (const cookie of upstream.headers.getSetCookie()) out.append('set-cookie', cookie);
    return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: out });
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: 'api_unreachable', message: 'PetCare could not be reached' },
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json' },
      },
    );
  }
};

export const ALL = handle;
