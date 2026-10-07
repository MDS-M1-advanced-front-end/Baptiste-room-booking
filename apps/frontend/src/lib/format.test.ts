import { describe, expect, it } from 'vitest';
import { formatDay, formatRate, formatTime } from './format';

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
