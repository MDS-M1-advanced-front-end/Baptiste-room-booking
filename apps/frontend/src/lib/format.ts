import { isoDate } from "./url-params";

const rate = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const longDay = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const amount = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const shortDay = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const hours = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export const formatAmount = (value: number) => amount.format(value);

export const formatDuration = (minutes: number) =>
  `${hours.format(minutes / 60)} h`;

export const formatHours = (minutes: number) =>
  `${hours.format(minutes / 60)} heure${minutes >= 120 ? "s" : ""}`;

export const formatRate = (value: number) => rate.format(value);

export const formatTime = (time: string) =>
  /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time.slice(0, 5) : time;

const dayFormatter = (format: Intl.DateTimeFormat) => (day: string) =>
  isoDate(day) ? format.format(new Date(`${day}T00:00:00Z`)) : day;

export const formatDay = dayFormatter(longDay);

export const formatShortDay = dayFormatter(shortDay);

const PARIS_STYLES = {
  date: { day: "numeric", month: "long", year: "numeric" },
  long: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  short: { weekday: "short", day: "numeric", month: "short" },
  day: { day: "numeric" },
  month: { month: "short" },
  time: { hour: "2-digit", minute: "2-digit" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type ParisStyle = keyof typeof PARIS_STYLES;

const parisFormats = Object.fromEntries(
  Object.entries(PARIS_STYLES).map(([style, options]) => [
    style,
    new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "Europe/Paris" }),
  ]),
) as Record<ParisStyle, Intl.DateTimeFormat>;

export const formatParis = (iso: string, style: ParisStyle) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : parisFormats[style].format(date);
};
