import type { RequestEventBase, RequestEventLoader } from '@builder.io/qwik-city';
import { getRoomsByRoomId, type Client, type Room } from '@room-booking/core';
import { api } from '~/lib/api/client.server';
import { requireRole } from '~/lib/auth.server';
import { MANAGER_ROLES } from '~/lib/navigation';
import { canManage } from '~/lib/rooms';

export async function roomsById(client: Client, ids: string[]) {
  const rooms = await Promise.all(
    [...new Set(ids)].map(
      async (roomId) => (await getRoomsByRoomId({ client, path: { roomId } })).data,
    ),
  );
  return Object.fromEntries(
    rooms.filter((room): room is Room => !!room).map((room) => [room.id, room]),
  );
}

type ManagerEvent = Parameters<typeof requireRole>[0] & RequestEventBase;

export async function managedRoom(event: ManagerEvent) {
  const user = requireRole(event, MANAGER_ROLES);
  const { data: room } = await getRoomsByRoomId({
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
