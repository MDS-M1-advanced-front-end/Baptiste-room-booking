import type { AvailabilitySlot } from '@room-booking/core';
import { describe, expect, it } from 'vitest';
import { estimatePrice, rangeMinutes, rangeOf, selectSlot, withOwnSlots } from './slots';

const slots: AvailabilitySlot[] = [
  { startTime: '08:00', endTime: '09:00', available: true },
  { startTime: '09:00', endTime: '10:00', available: false },
  { startTime: '10:00', endTime: '11:00', available: true },
  { startTime: '11:00', endTime: '12:00', available: true },
  { startTime: '12:00', endTime: '13:00', available: true },
];

describe('selectSlot', () => {
  it('selects a free slot', () => {
    expect(selectSlot(slots, null, 2)).toEqual({ start: 2, end: 2 });
  });

  it('extends forward over free slots', () => {
    expect(selectSlot(slots, { start: 2, end: 2 }, 4)).toEqual({ start: 2, end: 4 });
  });

  it('extends backward over free slots', () => {
    expect(selectSlot(slots, { start: 4, end: 4 }, 2)).toEqual({ start: 2, end: 4 });
  });

  it('restarts from a slot inside the current range', () => {
    expect(selectSlot(slots, { start: 2, end: 4 }, 3)).toEqual({ start: 3, end: 3 });
  });

  it('rejects a click on a taken slot: selection unchanged', () => {
    const current = { start: 2, end: 2 };
    expect(selectSlot(slots, current, 1)).toBe(current);
  });

  it('rejects a range spanning a taken slot: resets to single', () => {
    expect(selectSlot(slots, { start: 0, end: 0 }, 3)).toEqual({ start: 3, end: 3 });
  });

  it.each([99, -1])('rejects out of range index %i', (index) => {
    expect(selectSlot(slots, null, index)).toBeNull();
  });
});

describe('rangeMinutes and estimatePrice', () => {
  it('computes minutes and price', () => {
    expect(rangeMinutes(slots, { start: 2, end: 4 })).toBe(180);
    expect(estimatePrice(45, 180)).toBe(135);
    expect(estimatePrice(45.5, 90)).toBe(68.25);
  });

  it('rejects a range outside the slots: zero minutes', () => {
    expect(rangeMinutes(slots, { start: 7, end: 9 })).toBe(0);
  });
});

describe('withOwnSlots', () => {
  it('frees the slots held by the edited booking', () => {
    const own = withOwnSlots(slots, '09:00', '10:00');
    expect(own.map((slot) => slot.available)).toEqual([true, true, true, true, true]);
  });

  it('rejects freeing slots outside the booking', () => {
    expect(withOwnSlots(slots, '10:00', '11:00')[1].available).toBe(false);
  });
});

describe('rangeOf', () => {
  it('finds the slot range matching a booking', () => {
    expect(rangeOf(slots, '10:00', '12:00')).toEqual({ start: 2, end: 3 });
  });

  it.each([
    ['07:00', '09:00'],
    ['10:30', '12:00'],
    ['10:00', '14:00'],
  ])('rejects %s to %s not aligned on slots', (start, end) => {
    expect(rangeOf(slots, start, end)).toBeNull();
  });
});
