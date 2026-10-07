import type { Room, User } from '@room-booking/core';

export const canManage = (room: Pick<Room, 'ownerId'>, user: Pick<User, 'id' | 'role'>) =>
  user.role === 'ADMINISTRATEUR' || (user.role === 'GESTIONNAIRE' && room.ownerId === user.id);

export const ownedRooms = (rooms: Room[], user: Pick<User, 'id' | 'role'>) =>
  rooms.filter((room) => canManage(room, user));
