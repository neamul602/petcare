/**
 * Every screen from experience-blueprint.md §3 with an example path.
 * Used by navigation and by the end-to-end route table test.
 */
export type Role = 'owner' | 'provider' | 'admin';

export interface ScreenRoute {
  id: string;
  role: Role;
  path: string;
}

export const SCREEN_ROUTES: ScreenRoute[] = [
  { id: 'O1', role: 'owner', path: '/' },
  { id: 'O2', role: 'owner', path: '/sign-in' },
  { id: 'O3', role: 'owner', path: '/search' },
  { id: 'O7', role: 'owner', path: '/bookings' },
  { id: 'O8', role: 'owner', path: '/pets' },
  { id: 'O8', role: 'owner', path: '/pets/new' },
  { id: 'O9', role: 'owner', path: '/inbox' },
  { id: 'O10', role: 'owner', path: '/settings' },
  { id: 'P1', role: 'provider', path: '/provider' },
  { id: 'P2', role: 'provider', path: '/provider/calendar' },
  { id: 'P4', role: 'provider', path: '/provider/bookings' },
  { id: 'P5', role: 'provider', path: '/provider/earnings' },
  { id: 'P6', role: 'provider', path: '/provider/profile' },
  { id: 'P-inbox', role: 'provider', path: '/provider/inbox' },
  { id: 'P-settings', role: 'provider', path: '/provider/settings' },
  { id: 'A-sign-in', role: 'admin', path: '/admin/sign-in' },
  { id: 'A1', role: 'admin', path: '/admin' },
  { id: 'A2', role: 'admin', path: '/admin/acute' },
  { id: 'A3', role: 'admin', path: '/admin/reports' },
  { id: 'A4', role: 'admin', path: '/admin/providers' },
  { id: 'A5', role: 'admin', path: '/admin/reviews' },
  { id: 'A6', role: 'admin', path: '/admin/payouts' },
  { id: 'A7', role: 'admin', path: '/admin/insights' },
  { id: 'A8', role: 'admin', path: '/admin/audit' },
];
