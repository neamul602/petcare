/**
 * Protects the three areas (DR-3) and tells every page who is signed in.
 *  - owner pages (bookings, pets, inbox, settings, book) need an owner
 *  - /provider/* needs a provider
 *  - /admin/* needs the admin (except /admin/sign-in)
 * Guests are sent to sign in and come back afterwards; someone on the wrong side goes to their own home.
 */
import { defineMiddleware } from 'astro:middleware';
import { currentPerson } from '@/lib/api';

const OWNER_PATHS = ['/bookings', '/pets', '/inbox', '/settings', '/book'];
const startsWithPath = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  if (pathname.startsWith('/api/') || pathname === '/locale' || pathname.startsWith('/_'))
    return next();

  const cookie = context.request.headers.get('cookie');
  const isAdminArea = startsWith(pathname, '/admin');
  const isProviderArea = startsWith(pathname, '/provider');
  const isOwnerArea = OWNER_PATHS.some((base) => startsWithPath(pathname, base));

  if (isAdminArea) {
    const admin = await currentPerson(cookie, 'admin');
    if (admin) context.locals.admin = { role: 'admin', id: admin.id, name: admin.name };
    if (pathname === '/admin/sign-in' || pathname === '/admin/sign-out') {
      if (admin && pathname === '/admin/sign-in') return context.redirect('/admin');
      return next();
    }
    if (!admin) return context.redirect('/admin/sign-in');
    return next();
  }

  const person = await currentPerson(cookie, 'user');
  if (person && (person.role === 'owner' || person.role === 'provider')) {
    context.locals.user = { role: person.role, id: person.id, name: person.name };
  }
  const user = context.locals.user;

  if ((pathname === '/sign-in' || pathname === '/sign-up') && user)
    return context.redirect(user.role === 'provider' ? '/provider' : '/');

  if (isProviderArea) {
    if (!user) return context.redirect(`/sign-in?next=${encodeURIComponent(pathname + search)}`);
    if (user.role !== 'provider') return context.redirect('/');
  } else if (isOwnerArea) {
    if (!user) return context.redirect(`/sign-in?next=${encodeURIComponent(pathname + search)}`);
    if (user.role !== 'owner') return context.redirect('/provider');
  }
  return next();
});

function startsWith(path: string, base: string) {
  return startsWithPath(path, base);
}
