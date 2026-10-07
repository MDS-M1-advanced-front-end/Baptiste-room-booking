import type { RequestEventBase } from "@builder.io/qwik-city";
import { getRoomsByRoomIdAvailability } from "@room-booking/core";
import { api } from "~/lib/api/client.server";
import { parisToday } from "~/lib/dates";
import { isoDate } from "~/lib/url-params";

export const bookableDay = (
  requested: string | null,
  fallback: string,
  today: string,
) => [isoDate(requested), fallback].find((day) => day && day >= today) ?? today;

export async function loadAvailability(
  event: RequestEventBase,
  roomId: string | undefined,
  fallback: string,
) {
  const today = parisToday();
  const day = bookableDay(event.url.searchParams.get("date"), fallback, today);
  if (!roomId) return { today, day, slots: null };
  const { data } = await getRoomsByRoomIdAvailability({
    client: api(event),
    path: { roomId },
    query: { date: day },
  });
  return { today, day, slots: data ?? null };
}
