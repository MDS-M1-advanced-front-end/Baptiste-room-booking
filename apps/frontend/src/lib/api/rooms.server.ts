import { getRoomsByRoomId, type Client, type Room } from '@room-booking/core';

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
