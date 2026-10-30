/** Runbook actions for one acute event. The API decides; the page shows the new state. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const form = await request.formData();
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const intent = text('intent');
  const base = `/admin/acute-events/${params.id}`;
  const send = (path: string, body?: unknown) =>
    apiFetch(path, {
      method: 'POST',
      cookie: request.headers.get('cookie'),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    }).catch(() => null);
  const response =
    intent === 'step'
      ? await send(`${base}/steps`, {
          step: text('step'),
          status: text('status'),
          note: text('note'),
        })
      : intent === 'message'
        ? await send(`${base}/owner-message`, { language: text('language') })
        : intent === 'resolve'
          ? await send(`${base}/resolve`)
          : intent === 'post-mortem'
            ? await send(
                `${base}/post-mortem`,
                Object.fromEntries(
                  [
                    'timelineAccuracy',
                    'roles',
                    'ownerCommunication',
                    'directoryUse',
                    'gaps',
                    'lessons',
                  ].map((f) => [f, text(f)]),
                ),
              )
            : null;
  return new Response(null, {
    status: 303,
    headers: { location: `/admin/acute/${params.id}${response?.ok ? '' : '?error=1'}` },
  });
};
