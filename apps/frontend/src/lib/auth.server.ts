import type { RequestEventBase } from "@builder.io/qwik-city";
import type { User, UserRole } from "@room-booking/core";

export const USER_KEY = "user";
export const HOME = "/rooms/";

type GuardEvent = Pick<RequestEventBase, "sharedMap" | "url"> & {
  redirect: (status: 302, url: string) => unknown;
};

export const currentUser = (event: Pick<RequestEventBase, "sharedMap">) =>
  event.sharedMap.get(USER_KEY) as User | undefined;

export function requireUser(event: GuardEvent): User {
  const user = currentUser(event);
  if (!user) {
    throw event.redirect(
      302,
      `/login/?redirect=${encodeURIComponent(event.url.pathname + event.url.search)}`,
    );
  }
  return user;
}

export function requireRole(event: GuardEvent, roles: UserRole[]): User {
  const user = requireUser(event);
  if (!roles.includes(user.role)) throw event.redirect(302, HOME);
  return user;
}

export const safeRedirect = (target: string | null | undefined) =>
  target && /^\/(?![/\\])/.test(target) ? target : HOME;
