import type {
  RequestEventBase,
  RequestEventLoader,
} from "@builder.io/qwik-city";
import {
  getReservation,
  getRoom,
  getUser,
  type Client,
} from "@room-booking/core";
import { api } from "~/lib/api/client.server";
import { requireRole } from "~/lib/auth.server";
import { MANAGER_ROLES } from "~/lib/navigation";
import { canManage } from "~/lib/rooms";

async function byId<T extends { id: string }>(
  ids: string[],
  get: (id: string) => Promise<{ data?: T }>,
) {
  const items = await Promise.all(
    [...new Set(ids)].map(async (id) => (await get(id)).data),
  );
  return Object.fromEntries(
    items.flatMap((item) => (item ? [[item.id, item] as const] : [])),
  );
}

export const roomsById = (client: Client, ids: string[]) =>
  byId(ids, (roomId) => getRoom({ client, path: { roomId } }));

export const usersById = (client: Client, ids: string[]) =>
  byId(ids, (userId) => getUser({ client, path: { userId } }));

type ManagerEvent = Parameters<typeof requireRole>[0] & RequestEventBase;

export async function managedRoom(event: ManagerEvent) {
  const user = requireRole(event, MANAGER_ROLES);
  const { data: room } = await getRoom({
    client: api(event),
    path: { roomId: event.params.id },
  });
  return { room, allowed: !!room && canManage(room, user) };
}

export async function loadManagedRoom(event: RequestEventLoader) {
  const { room, allowed } = await managedRoom(event);
  if (!allowed) event.status(room ? 403 : 404);
  return allowed ? room! : null;
}

export async function managedReservation(
  event: ManagerEvent,
  reservationId: string,
) {
  const user = requireRole(event, MANAGER_ROLES);
  const client = api(event);
  const { data: reservation } = await getReservation({
    client,
    path: { reservationId },
  });
  if (!reservation) return { status: 404 } as const;
  const { data: room } = await getRoom({
    client,
    path: { roomId: reservation.roomId },
  });
  if (!room || !canManage(room, user)) return { status: 403 } as const;
  const { data: requester } = await getUser({
    client,
    path: { userId: reservation.userId },
  });
  return { status: 200, reservation, room, requester } as const;
}
