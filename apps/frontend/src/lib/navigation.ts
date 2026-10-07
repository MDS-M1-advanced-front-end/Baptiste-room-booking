import type { User } from '@room-booking/core';

export interface NavItem {
  href: string;
  label: string;
  count?: number;
}

export const MANAGER_ROLES: User['role'][] = ['GESTIONNAIRE', 'ADMINISTRATEUR'];

export const isManager = (user: Pick<User, 'role'> | null | undefined) =>
  !!user && MANAGER_ROLES.includes(user.role);

export function navItems(user: Pick<User, 'role'> | null, pendingCount: number): NavItem[] {
  const catalogue = { href: '/rooms/', label: 'Catalogue' };
  if (!user) return [catalogue];
  if (isManager(user)) {
    return [
      catalogue,
      { href: '/manage/rooms/', label: 'Mes salles' },
      { href: '/manage/requests/', label: 'Demandes', count: pendingCount },
    ];
  }
  return [catalogue, { href: '/bookings/', label: 'Mes réservations' }];
}

export const isCurrent = (pathname: string, href: string) =>
  href === '/rooms/'
    ? pathname === href || /^\/rooms\/[^/]+\/$/.test(pathname)
    : pathname.startsWith(href);
