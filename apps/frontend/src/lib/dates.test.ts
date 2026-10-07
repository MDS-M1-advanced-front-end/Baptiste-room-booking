import { describe, expect, it } from 'vitest';
import { addDays, parisIso, parisToday } from './dates';

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

describe('parisIso', () => {
  it.each([
    ['2026-10-08', '10:00', '2026-10-08T08:00:00.000Z'],
    ['2026-11-16', '15:00', '2026-11-16T14:00:00.000Z'],
    ['2026-10-25', '10:00', '2026-10-25T09:00:00.000Z'],
    ['2026-03-29', '04:00', '2026-03-29T02:00:00.000Z'],
    ['2026-12-31', '23:00', '2026-12-31T22:00:00.000Z'],
  ])('converts Paris wall time %s %s to UTC', (day, time, iso) => {
    expect(parisIso(day, time)).toBe(iso);
  });

  it('does not depend on the server timezone', () => {
    const tz = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(parisIso('2026-10-08', '10:00')).toBe('2026-10-08T08:00:00.000Z');
    } finally {
      process.env.TZ = tz;
    }
  });

  it.each([
    ['nope', '10:00'],
    ['2026-10-08', 'noon'],
  ])('rejects invalid input %s %s', (day, time) => {
    expect(() => parisIso(day, time)).toThrow(RangeError);
  });
});
