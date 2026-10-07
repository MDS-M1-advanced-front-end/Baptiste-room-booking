import { describe, expect, it } from 'vitest';
import { collectErrors } from './error-summary';

const fields = { email: 'Adresse e-mail', password: 'Mot de passe' };

describe('collectErrors', () => {
  it('keeps field order and the first message', () => {
    expect(collectErrors(fields, { password: ['court', 'autre'], email: 'invalide' })).toEqual([
      { id: 'email', label: 'Adresse e-mail', message: 'invalide' },
      { id: 'password', label: 'Mot de passe', message: 'court' },
    ]);
  });

  it('rejects unknown fields and empty errors', () => {
    expect(collectErrors(fields, { other: 'x' })).toEqual([]);
    expect(collectErrors(fields, undefined)).toEqual([]);
  });
});
