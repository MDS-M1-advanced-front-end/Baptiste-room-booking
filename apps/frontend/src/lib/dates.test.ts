import { describe, expect, it } from 'vitest';
import { addDays, parisToday } from './dates';

describe('parisToday', () => {
  it('uses the Paris calendar day, not UTC', () => {
    expect(parisToday(new Date('2026-10-07T22:30:00Z'))).toBe('2026-10-08');
    expect(parisToday(new Date('2026-12-31T22:59:00Z'))).toBe('2026-12-31');
  });
});

describe('addDays', () => {
  it.each([
    ['2026-10-31', 1, '2026-11-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2026-03-29', 1, '2026-03-30'],
    ['2026-12-31', 1, '2027-01-01'],
  ])('moves %s by %i to %s', (day, offset, expected) => {
    expect(addDays(day, offset)).toBe(expected);
  });
});
