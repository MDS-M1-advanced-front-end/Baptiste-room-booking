import type { RequestEventAction } from '@builder.io/qwik-city';
import type { AuthResponse } from '@room-booking/core';
import { safeRedirect } from '~/lib/auth.server';
import { saveToken } from '~/lib/session.server';

const DEFAULT_SESSION_SECONDS = 3600;

export function startSession(event: RequestEventAction, auth: AuthResponse) {
  saveToken(
    event.cookie,
    auth.accessToken,
    auth.expiresIn ?? DEFAULT_SESSION_SECONDS,
    event.url.protocol === 'https:',
  );
  return event.redirect(303, safeRedirect(event.url.searchParams.get('redirect')));
}
