import type { Reservation, ReservationStatus } from '@room-booking/core';
import { describe, expect, it } from 'vitest';
import { canEdit, slotLabel, slotSentence, splitByTime, splitRequests } from './bookings';

const now = new Date('2026-10-10T12:00:00Z');

const reservation = (
  id: string,
  status: ReservationStatus,
  startAt: string,
  endAt: string,
): Reservation => ({ id, roomId: 'r', userId: 'u', status, startAt, endAt, totalAmount: 0 });

const future = reservation('future', 'CONFIRMED', '2026-10-12T09:00:00Z', '2026-10-12T12:00:00Z');
const later = reservation('later', 'PENDING', '2026-10-20T09:00:00Z', '2026-10-20T12:00:00Z');
const ended = reservation('ended', 'CONFIRMED', '2026-10-01T09:00:00Z', '2026-10-01T12:00:00Z');
const endingNow = reservation('now', 'CONFIRMED', '2026-10-10T10:00:00Z', '2026-10-10T12:00:00Z');
const rejected = reservation(
  'rejected',
  'REJECTED',
  '2026-10-15T09:00:00Z',
  '2026-10-15T12:00:00Z',
);

describe('splitByTime', () => {
  it('puts active future bookings in upcoming, soonest first', () => {
    const { upcoming } = splitByTime([later, ended, future], now);
    expect(upcoming.map((item) => item.id)).toEqual(['future', 'later']);
  });

  it('puts ended, rejected and cancelled bookings in past, latest first', () => {
    const { past } = splitByTime([ended, rejected, future], now);
    expect(past.map((item) => item.id)).toEqual(['rejected', 'ended']);
  });

  it('rejects a booking ending exactly now as past', () => {
    expect(splitByTime([endingNow], now).upcoming).toEqual([endingNow]);
  });
});

describe('canEdit', () => {
  it.each([future, later])('allows a future active booking %#', (item) => {
    expect(canEdit(item, now)).toBe(true);
  });

  it.each([['CANCELLED' as const], ['REJECTED' as const], ['COMPLETED' as const]])(
    'rejects a %s booking',
    (status) => {
      expect(canEdit({ ...future, status }, now)).toBe(false);
    },
  );

  it('rejects a started or past pending booking', () => {
    expect(canEdit({ ...ended, status: 'PENDING' }, now)).toBe(false);
    expect(canEdit(endingNow, now)).toBe(false);
  });
});

describe('slot labels', () => {
  it('formats the compact Paris slot', () => {
    expect(slotLabel(future)).toBe('lun. 12 oct. · 11:00 – 14:00');
  });

  it('formats the sentence Paris slot', () => {
    expect(slotSentence(future)).toBe('lundi 12 octobre 2026, de 11:00 à 14:00');
  });
});

describe('splitRequests', () => {
  it('puts pending requests first, soonest first, and the rest in handled', () => {
    const { pending, handled } = splitRequests([rejected, later, future, ended]);
    expect(pending.map((item) => item.id)).toEqual(['later']);
    expect(handled.map((item) => item.id)).toEqual(['ended', 'future', 'rejected']);
  });

  it('rejects nothing into pending when no request is PENDING', () => {
    expect(splitRequests([future, ended]).pending).toEqual([]);
  });
});
