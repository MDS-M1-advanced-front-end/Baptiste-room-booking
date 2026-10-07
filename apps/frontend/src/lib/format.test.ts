import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatDay,
  formatDuration,
  formatParis,
  formatHours,
  formatRate,
  formatShortDay,
  formatTime,
} from './format';

const spaces = (value: string) => value.replace(/\s+/g, ' ');

describe('formatRate', () => {
  it('formats a whole euro rate like the mockup', () => {
    expect(spaces(formatRate(45))).toBe('45 €');
    expect(spaces(formatRate(1250))).toBe('1 250 €');
  });
});

describe('formatTime', () => {
  it.each([
    ['08:00:00', '08:00'],
    ['14:30', '14:30'],
  ])('shortens %s to %s', (input, output) => {
    expect(formatTime(input)).toBe(output);
  });

  it.each(['nope', '', '8h'])('returns invalid input %s unchanged', (input) => {
    expect(formatTime(input)).toBe(input);
  });
});

describe('formatDay', () => {
  it('formats a calendar day in french without timezone shift', () => {
    expect(formatDay('2026-11-16')).toBe('lundi 16 novembre 2026');
    expect(formatDay('2026-01-01')).toBe('jeudi 1 janvier 2026');
  });

  it.each(['nope', '2026-13-45', ''])('returns invalid day %s unchanged', (input) => {
    expect(formatDay(input)).toBe(input);
  });
});

describe('formatAmount', () => {
  it('formats cents like the mockup summary', () => {
    expect(spaces(formatAmount(135))).toBe('135,00 €');
    expect(spaces(formatAmount(68.25))).toBe('68,25 €');
  });
});

describe('formatShortDay', () => {
  it('formats a short calendar day', () => {
    expect(formatShortDay('2026-11-16')).toBe('lun. 16 nov. 2026');
  });

  it('returns an invalid day unchanged', () => {
    expect(formatShortDay('nope')).toBe('nope');
  });
});

describe('formatHours', () => {
  it.each([
    [60, '1 heure'],
    [180, '3 heures'],
    [90, '1,5 heure'],
  ])('formats %i minutes as %s', (minutes, label) => {
    expect(formatHours(minutes)).toBe(label);
  });
});

describe('formatDuration', () => {
  it.each([
    [120, '2 h'],
    [90, '1,5 h'],
  ])('formats %i minutes as %s', (minutes, label) => {
    expect(formatDuration(minutes)).toBe(label);
  });
});

describe('formatParis', () => {
  it.each([
    ['date', '2026-02-11T09:00:00Z', '11 février 2026'],
    ['date', '2026-02-10T23:30:00Z', '11 février 2026'],
    ['long', '2026-10-12T09:00:00Z', 'lundi 12 octobre 2026'],
    ['short', '2026-10-12T09:00:00Z', 'lun. 12 oct.'],
    ['day', '2026-10-12T09:00:00Z', '12'],
    ['month', '2026-10-12T09:00:00Z', 'oct.'],
    ['time', '2026-10-12T09:00:00Z', '11:00'],
    ['time', '2026-11-16T14:00:00Z', '15:00'],
  ] as const)('formats %s of %s in Paris as %s', (style, iso, expected) => {
    expect(formatParis(iso, style)).toBe(expected);
  });

  it.each(['nope', ''])('returns invalid instant %s unchanged', (input) => {
    expect(formatParis(input, 'time')).toBe(input);
  });
});
