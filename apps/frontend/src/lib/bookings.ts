import type { Reservation } from '@room-booking/core';
import { formatParis } from './format';

const ACTIVE = new Set<Reservation['status']>(['PENDING', 'CONFIRMED']);

const time = (iso: string) => Date.parse(iso);

const isUpcoming = (reservation: Reservation, now: Date) =>
  ACTIVE.has(reservation.status) && time(reservation.endAt) >= now.getTime();

export function splitByTime(reservations: Reservation[], now: Date) {
  const byStart = (a: Reservation, b: Reservation) => time(a.startAt) - time(b.startAt);
  return {
    upcoming: reservations.filter((item) => isUpcoming(item, now)).sort(byStart),
    past: reservations.filter((item) => !isUpcoming(item, now)).sort((a, b) => byStart(b, a)),
  };
}

export const canEdit = (reservation: Reservation, now: Date) =>
  ACTIVE.has(reservation.status) && time(reservation.startAt) > now.getTime();

const hours = (reservation: Reservation) =>
  [formatParis(reservation.startAt, 'time'), formatParis(reservation.endAt, 'time')] as const;

export const slotLabel = (reservation: Reservation) => {
  const [start, end] = hours(reservation);
  return `${formatParis(reservation.startAt, 'short')} · ${start} – ${end}`;
};

export const slotSentence = (reservation: Reservation) => {
  const [start, end] = hours(reservation);
  return `${formatParis(reservation.startAt, 'long')}, de ${start} à ${end}`;
};
