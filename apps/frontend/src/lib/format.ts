import { isoDate } from './url-params';

const rate = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const longDay = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatRate = (amount: number) => rate.format(amount);

export const formatTime = (time: string) =>
  /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time.slice(0, 5) : time;

export const formatDay = (day: string) =>
  isoDate(day) ? longDay.format(new Date(`${day}T00:00:00Z`)) : day;
