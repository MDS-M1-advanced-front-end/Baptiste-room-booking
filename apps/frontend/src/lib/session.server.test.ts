import { describe, expect, it } from 'vitest';
import type { Cookie, CookieOptions } from '@builder.io/qwik-city';
import { SESSION_COOKIE, clearToken, readToken, saveToken } from './session.server';

function fakeCookie() {
  const store = new Map<string, { value: string; options?: CookieOptions }>();
  const cookie = {
    get: (name: string) => store.get(name),
    set: (name: string, value: string, options?: CookieOptions) =>
      store.set(name, { value, options }),
    delete: (name: string) => store.delete(name),
  } as unknown as Cookie;
  return { cookie, store };
}

describe('session cookie', () => {
  it('saves the token as an httpOnly lax cookie on the whole site', () => {
    const { cookie, store } = fakeCookie();
    saveToken(cookie, 'jwt', 3600, true);
    expect(readToken(cookie)).toBe('jwt');
    expect(store.get(SESSION_COOKIE)?.options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 3600,
    });
  });

  it('rejects a cleared session: no token', () => {
    const { cookie } = fakeCookie();
    saveToken(cookie, 'jwt', 3600, false);
    clearToken(cookie);
    expect(readToken(cookie)).toBeUndefined();
  });

  it('rejects an empty cookie jar: no token', () => {
    expect(readToken(fakeCookie().cookie)).toBeUndefined();
  });
});
