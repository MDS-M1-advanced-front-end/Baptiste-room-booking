import { isoDate, timeOfDay } from './url-params';

const parisDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const parisToday = (now = new Date()) => parisDay.format(now);

export function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

const parisClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Paris',
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

const parisOffset = (instant: number) => {
  const part = Object.fromEntries(
    parisClock.formatToParts(instant).map(({ type, value }) => [type, Number(value)]),
  );
  return Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute) - instant;
};

export function parisIso(day: string, time: string) {
  if (!isoDate(day) || !timeOfDay(time)) throw new RangeError(`Invalid Paris time ${day} ${time}`);
  const wall = Date.parse(`${day}T${time}:00Z`);
  return new Date(wall - parisOffset(wall - parisOffset(wall))).toISOString();
}
