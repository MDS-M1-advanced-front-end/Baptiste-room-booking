import type { ListRoomsData, ReservationStatus } from "@room-booking/core";

export const PAGE_SIZE = 6;

export type RoomsQuery = NonNullable<ListRoomsData["query"]> & {
  page: number;
  pageSize: number;
};

export const positiveInt = (value: string | null) => {
  const n = Number(value);
  return value && Number.isInteger(n) && n > 0 ? n : undefined;
};

export const isoDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    ? value
    : undefined;
};

export const timeOfDay = (value: string | null) =>
  value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : undefined;

const text = (value: string | null) => value?.trim() || undefined;

export function parseRoomsQuery(params: URLSearchParams): RoomsQuery {
  const query: RoomsQuery = {
    search: text(params.get("search")),
    location: text(params.get("location")),
    capacityMin: positiveInt(params.get("capacityMin")),
    capacityMax: positiveInt(params.get("capacityMax")),
    date: isoDate(params.get("date")),
    startTime: timeOfDay(params.get("startTime")),
    endTime: timeOfDay(params.get("endTime")),
    available:
      ["true", "on"].includes(params.get("available") ?? "") || undefined,
    page: positiveInt(params.get("page")) ?? 1,
    pageSize: PAGE_SIZE,
  };
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as RoomsQuery;
}

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const satisfies readonly ReservationStatus[];

export const parseStatus = (
  value: string | null,
): ReservationStatus | undefined =>
  RESERVATION_STATUSES.find((status) => status === value);
