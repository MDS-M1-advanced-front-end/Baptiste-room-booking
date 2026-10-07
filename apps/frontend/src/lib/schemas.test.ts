import { describe, expect, it } from 'vitest';
import { z } from '@builder.io/qwik-city';
import { loginShape, profileShape, registerShape, reservationSchema } from './schemas';

const login = z.object(loginShape);
const register = z.object(registerShape);
const profile = z.object(profileShape);

const firstIssue = (result: z.SafeParseReturnType<unknown, unknown>) =>
  result.success ? undefined : result.error.issues[0];

describe('loginShape', () => {
  it('accepts an email and a password', () => {
    expect(login.safeParse({ email: ' client1@salles.example ', password: 'x' })).toMatchObject({
      success: true,
      data: { email: 'client1@salles.example' },
    });
  });

  it('rejects a malformed email', () => {
    expect(firstIssue(login.safeParse({ email: 'lea.martin@', password: 'x' }))?.path).toEqual([
      'email',
    ]);
  });

  it('rejects an empty password', () => {
    expect(firstIssue(login.safeParse({ email: 'a@b.fr', password: '' }))?.path).toEqual([
      'password',
    ]);
  });
});

describe('registerShape', () => {
  const valid = { firstName: 'Léa', lastName: 'Martin', email: 'lea@x.fr', password: 'abcdefgh' };

  it('accepts a complete account', () => {
    expect(register.safeParse(valid).success).toBe(true);
  });

  it('rejects a 6 characters password with the counted message', () => {
    const issue = firstIssue(register.safeParse({ ...valid, password: 'abc123' }));
    expect(issue?.path).toEqual(['password']);
    expect(issue?.message).toBe('Le mot de passe contient 6 caractères, il en faut au moins 8.');
  });

  it('rejects a blank last name', () => {
    expect(firstIssue(register.safeParse({ ...valid, lastName: '   ' }))?.path).toEqual([
      'lastName',
    ]);
  });
});

describe('profileShape', () => {
  it('accepts names and email', () => {
    expect(
      profile.safeParse({ firstName: 'Léa', lastName: 'Martin', email: 'l@x.fr' }).success,
    ).toBe(true);
  });

  it('rejects a missing email', () => {
    expect(firstIssue(profile.safeParse({ firstName: 'Léa', lastName: 'Martin' }))?.path).toEqual([
      'email',
    ]);
  });
});

describe('reservationSchema', () => {
  const valid = {
    date: '2026-11-16',
    startTime: '15:00',
    endTime: '18:00',
    numberOfParticipants: '8',
    comment: 'Atelier',
  };

  it('accepts a booking request and coerces participants', () => {
    expect(reservationSchema.safeParse(valid)).toMatchObject({
      success: true,
      data: { numberOfParticipants: 8 },
    });
  });

  it('accepts an empty comment', () => {
    expect(reservationSchema.safeParse({ ...valid, comment: '' }).success).toBe(true);
  });

  it.each([
    [{ numberOfParticipants: '0' }, 'numberOfParticipants'],
    [{ numberOfParticipants: 'abc' }, 'numberOfParticipants'],
    [{ numberOfParticipants: '2.5' }, 'numberOfParticipants'],
    [{ comment: 'x'.repeat(501) }, 'comment'],
    [{ date: '2026-13-45' }, 'date'],
    [{ startTime: '' }, 'startTime'],
    [{ endTime: '25:00' }, 'endTime'],
    [{ endTime: '15:00' }, 'endTime'],
    [{ endTime: '14:00' }, 'endTime'],
  ])('rejects %o on %s', (patch, path) => {
    expect(firstIssue(reservationSchema.safeParse({ ...valid, ...patch }))?.path).toEqual([path]);
  });
});
