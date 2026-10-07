import type { Room, User } from '@room-booking/core';
import { describe, expect, it } from 'vitest';
import { canManage, ownedRooms } from './rooms';

const room = (id: string, ownerId?: string) =>
  ({
    id,
    ownerId,
    name: id,
    capacity: 1,
    location: 'x',
    pricePerHour: 1,
    status: 'ACTIVE',
  }) as Room;
const user = (id: string, role: User['role']) => ({ id, role }) as User;

const rooms = [room('a', 'g1'), room('b', 'g2'), room('c')];

describe('ownedRooms', () => {
  it('keeps the rooms of a gestionnaire', () => {
    expect(ownedRooms(rooms, user('g1', 'GESTIONNAIRE')).map((r) => r.id)).toEqual(['a']);
  });

  it('shows every room to an administrateur', () => {
    expect(ownedRooms(rooms, user('admin', 'ADMINISTRATEUR'))).toHaveLength(3);
  });

  it('rejects other owners and rooms without owner for a gestionnaire', () => {
    expect(ownedRooms(rooms, user('g3', 'GESTIONNAIRE'))).toEqual([]);
  });

  it('rejects a client', () => {
    expect(ownedRooms(rooms, user('g1', 'CLIENT'))).toEqual([]);
    expect(canManage(rooms[0], user('g1', 'CLIENT'))).toBe(false);
  });
});
