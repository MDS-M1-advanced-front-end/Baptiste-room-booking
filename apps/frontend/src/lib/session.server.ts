import type { Cookie } from "@builder.io/qwik-city";

export const SESSION_COOKIE = "quorum_session";

export const readToken = (cookie: Cookie) => cookie.get(SESSION_COOKIE)?.value;

// Secure off only in dev: plain-http localhost must still get the cookie.
export const saveToken = (cookie: Cookie, token: string, maxAge: number) =>
  cookie.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !import.meta.env.DEV,
    path: "/",
    maxAge,
  });

export const clearToken = (cookie: Cookie) =>
  cookie.delete(SESSION_COOKIE, { path: "/" });
