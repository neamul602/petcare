/** Admin resolves a report: no action, a refund, and/or a provider action, with a rationale. */
import type { APIRoute } from 'astro';
import { apiFetch } from '@/lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const form = await request.formData();
  const refund = Number(form.get('refund'));
  const action = String(form.get('providerAction') ?? '');
  const response = await apiFetch(`/admin/reports/${params.id}/resolve`, {
    method: 'POST',
    cookie: request.headers.get('cookie'),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      rationale: String(form.get('rationale') ?? ''),
      ...(refund > 0 ? { refundPoisha: refund } : {}),
      ...(action ? { providerAction: action } : {}),
    }),
  }).catch(() => null);
  return new Response(null, {
    status: 303,
    headers: { location: `/admin/reports/${params.id}${response?.ok ? '' : '?error=1'}` },
  });
};
