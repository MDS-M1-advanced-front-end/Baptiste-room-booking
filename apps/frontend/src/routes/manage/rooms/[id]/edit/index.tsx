import { component$ } from '@builder.io/qwik';
import {
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
  type RequestEventBase,
} from '@builder.io/qwik-city';
import { getRoomsByRoomId, patchRoomsByRoomId } from '@room-booking/core';
import { RoomForm } from '~/components/room-form/room-form';
import { ButtonLink } from '~/components/ui/button';
import { BackLink, EmptyState } from '~/components/ui/page-header';
import { api } from '~/lib/api/client.server';
import { requireRole } from '~/lib/auth.server';
import { MANAGER_ROLES } from '~/lib/navigation';
import { canManage, roomError } from '~/lib/rooms';
import { roomShape } from '~/lib/schemas';

const managedRoom = async (event: Parameters<typeof requireRole>[0] & RequestEventBase) => {
  const user = requireRole(event, MANAGER_ROLES);
  const { data: room } = await getRoomsByRoomId({
    client: api(event),
    path: { roomId: event.params.id },
  });
  return { room, allowed: !!room && canManage(room, user) };
};

export const useEditedRoom = routeLoader$(async (event) => {
  const { room, allowed } = await managedRoom(event);
  if (!allowed) event.status(room ? 403 : 404);
  return allowed ? room! : null;
});

export const useUpdateRoom = routeAction$(async (body, event) => {
  const { room, allowed } = await managedRoom(event);
  if (!room || !allowed) {
    const status = room ? 403 : 404;
    return event.fail(status, { message: roomError(status) });
  }
  const { data, response } = await patchRoomsByRoomId({
    client: api(event),
    path: { roomId: room.id },
    body,
  });
  if (!data) return event.fail(response?.status ?? 500, { message: roomError(response?.status) });
  throw event.redirect(303, '/manage/rooms/');
}, zod$(roomShape));

export default component$(() => {
  const room = useEditedRoom();
  const update = useUpdateRoom();
  if (!room.value) {
    return (
      <>
        <BackLink href="/manage/rooms/" label="Mes salles" />
        <EmptyState
          title="Salle introuvable"
          icon="building"
          description="Cette salle n'existe pas ou ne fait pas partie de vos salles."
        >
          <ButtonLink href="/manage/rooms/" variant="secondary">
            Voir mes salles
          </ButtonLink>
        </EmptyState>
      </>
    );
  }
  return <RoomForm title={`Modifier ${room.value.name}`} room={room.value} action={update} />;
});

export const head: DocumentHead = ({ resolveValue }) => ({
  title: `Modifier ${resolveValue(useEditedRoom)?.name ?? 'la salle'}`,
});
