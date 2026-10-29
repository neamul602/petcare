/**
 * Server-side access to the PetCare API. The browser never talks to the API directly: pages call
 * /api/... on the web origin, which this module's proxy forwards, so cookies stay httpOnly and same-site.
 */
export const API_URL = process.env.API_URL ?? import.meta.env.API_URL ?? 'http://localhost:3000';

export async function apiFetch(
  path: string,
  init: RequestInit & { cookie?: string | null } = {},
): Promise<Response> {
  const { cookie, headers, ...rest } = init;
  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { ...(cookie ? { cookie } : {}), ...(headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(5000),
  });
}

/** Who is signed in? Returns null for guests and when the API cannot answer (fail safe: treat as guest). */
export async function currentPerson(cookieHeader: string | null, kind: 'user' | 'admin') {
  if (!cookieHeader) return null;
  const name = kind === 'admin' ? 'pc_admin_session' : 'pc_session';
  if (!cookieHeader.includes(`${name}=`)) return null;
  try {
    const response = await apiFetch(kind === 'admin' ? '/admin/auth/me' : '/auth/me', {
      cookie: cookieHeader,
    });
    if (!response.ok) return null;
    const { user } = (await response.json()) as {
      user: { role: string; id: string; name: string };
    };
    return user;
  } catch {
    return null;
  }
}

/** Copies every Set-Cookie header from an API response onto a new Headers object. */
export function copyCookies(from: Response, to: Headers) {
  for (const cookie of from.headers.getSetCookie()) to.append('set-cookie', cookie);
}
