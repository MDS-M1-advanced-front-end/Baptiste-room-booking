import type {
  Client,
  PaginatedReservations,
  PaginatedRooms,
  Reservation,
  Room,
} from '@room-booking/core';
import rooms from '../../../../../mock/data/rooms.json';
import users from '../../../../../mock/data/users.json';
import reservations from '../../../../../mock/data/reservations.json';

const MOCK_TOKEN_PREFIX = 'mock-token-';

const roomKeyById = new Map(rooms.map((room) => [room.id, room.key]));
const roomOwnerById = new Map(rooms.map((room) => [room.id, room.ownerId]));
const userKeyById = new Map(users.map((user) => [user.id, user.key]));
const userKeyByEmail = new Map(users.map((user) => [user.email, user.key]));
const userByKey = new Map(users.map((user) => [user.key, user]));
const reservationIds = new Set(reservations.map((reservation) => reservation.id));

const mockUser = (token: string | undefined) =>
  token?.startsWith(MOCK_TOKEN_PREFIX)
    ? userByKey.get(token.slice(MOCK_TOKEN_PREFIX.length))
    : undefined;

const exampleById: Record<string, (id: string) => string | undefined> = {
  rooms: (id) => roomKeyById.get(id),
  users: (id) => userKeyById.get(id),
  reservations: (id) => (reservationIds.has(id) ? id : undefined),
};

export async function preferFor(
  request: Request,
  token: string | undefined,
): Promise<string | undefined> {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith('/auth/login')) {
    const { email } = (await request.clone().json()) as { email?: string };
    const key = email ? userKeyByEmail.get(email) : undefined;
    return key ? `example=${key}` : 'code=401';
  }
  if (pathname.endsWith('/auth/me')) {
    const user = mockUser(token);
    return user ? `example=${user.key}` : undefined;
  }
  const [, collection, id] = /\/(rooms|users|reservations)\/([^/]+)$/.exec(pathname) ?? [];
  if (request.method !== 'GET' || !collection || !id) return undefined;
  const example = exampleById[collection](id);
  return example ? `example=${example}` : 'code=404';
}

const paginate = <T>(items: T[], params: URLSearchParams) => {
  const page = Number(params.get('page')) || 1;
  const pageSize = Number(params.get('pageSize')) || 20;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: items.length,
  };
};

const includesText = (value: string | undefined, search: string) =>
  (value ?? '').toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'));

function filterRooms(items: Room[], params: URLSearchParams) {
  const search = params.get('search');
  const location = params.get('location');
  const capacityMin = Number(params.get('capacityMin')) || 0;
  const capacityMax = Number(params.get('capacityMax')) || Infinity;
  return items.filter(
    (room) =>
      (!search || includesText(room.name, search) || includesText(room.description, search)) &&
      (!location || room.location === location) &&
      room.capacity >= capacityMin &&
      room.capacity <= capacityMax,
  );
}

function filterReservations(
  items: Reservation[],
  params: URLSearchParams,
  token: string | undefined,
) {
  const viewer = mockUser(token);
  if (!viewer) return [];
  const status = params.get('status');
  const from = params.get('from');
  const to = params.get('to');
  return items.filter(
    (reservation) =>
      (viewer.role === 'CLIENT'
        ? reservation.userId === viewer.id
        : viewer.role === 'ADMINISTRATEUR' ||
          roomOwnerById.get(reservation.roomId) === viewer.id) &&
      (!status || reservation.status === status) &&
      (!from || reservation.startAt >= from) &&
      (!to || reservation.startAt <= to),
  );
}

export function emulateList(url: URL, body: unknown, token: string | undefined): unknown {
  const { pathname, searchParams } = url;
  if (pathname.endsWith('/rooms')) {
    return paginate(filterRooms((body as PaginatedRooms).items, searchParams), searchParams);
  }
  if (pathname.endsWith('/reservations')) {
    return paginate(
      filterReservations((body as PaginatedReservations).items, searchParams, token),
      searchParams,
    );
  }
  return body;
}

export function withMock(client: Client, token: string | undefined) {
  client.interceptors.request.use(async (request) => {
    const prefer = await preferFor(request, token);
    if (prefer) request.headers.set('Prefer', prefer);
    return request;
  });
  client.interceptors.response.use(async (response, request) => {
    if (request.method !== 'GET' || !response.ok) return response;
    const body: unknown = await response.json();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return Response.json(emulateList(new URL(request.url), body, token), {
      status: response.status,
      headers,
    });
  });
}
