import { describe, expect, it } from 'vitest';
import { reservationError } from './reservation-errors';

describe('reservationError', () => {
  it('explains a conflict', () => {
    expect(reservationError(409)).toBe("Ce créneau n'est plus disponible. Choisissez-en un autre.");
  });

  it.each([500, undefined, 0])(
    'rejects unknown status %s with a generic retry message',
    (status) => {
      expect(reservationError(status)).toBe("La demande n'a pas pu être envoyée. Réessayez.");
    },
  );
});
