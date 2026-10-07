import type { Cookie } from '@builder.io/qwik-city';

export const SESSION_COOKIE = 'quorum_session';

export const readToken = (cookie: Cookie) => cookie.get(SESSION_COOKIE)?.value;

export const saveToken = (cookie: Cookie, token: string, maxAge: number, secure: boolean) =>
  cookie.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge });

export const clearToken = (cookie: Cookie) => cookie.delete(SESSION_COOKIE, { path: '/' });
