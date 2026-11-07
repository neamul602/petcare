/** JWT (HS256) signed with the Node crypto module: no extra dependency. The token carries who the person is and which table they live in. */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const JWT_COOKIE = 'pc_token';
export const JWT_HOURS = 24;

export interface JwtPayload {
  sub: string;
  kind: 'user' | 'admin';
  role: 'owner' | 'provider' | 'admin' | 'superuser';
  exp: number;
}

const secret = () => process.env.JWT_SECRET ?? 'petcare-dev-only-secret-change-me';
const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');

export function signJwt(payload: Omit<JwtPayload, 'exp'>, now = Date.now()): string {
  const body = encode({ ...payload, exp: Math.floor(now / 1000) + JWT_HOURS * 3600 });
  const head = encode({ alg: 'HS256', typ: 'JWT' });
  return `${head}.${body}.${sign(`${head}.${body}`)}`;
}

export function verifyJwt(token: string | undefined, now = Date.now()): JwtPayload | null {
  if (!token) return null;
  const [head, body, signature] = token.split('.');
  if (!head || !body || !signature) return null;
  const expected = Buffer.from(sign(`${head}.${body}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as JwtPayload;
    return payload.exp * 1000 > now ? payload : null;
  } catch {
    return null;
  }
}

/** The token from the httpOnly cookie, or from an `Authorization: Bearer` header for API clients. */
export function tokenFrom(request: {
  cookies: Record<string, string | undefined>;
  headers: Record<string, unknown>;
}): string | undefined {
  const header = request.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) return header.slice(7);
  return request.cookies[JWT_COOKIE];
}
