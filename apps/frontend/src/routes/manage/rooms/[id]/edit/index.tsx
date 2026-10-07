import { component$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { patchRoomsByRoomId } from '@room-booking/core';
import { RoomForm } from '~/components/room-form/room-form';
import { ButtonLink } from '~/components/ui/button';
import { BackLink, EmptyState } from '~/components/ui/page-header';
import { api } from '~/lib/api/client.server';
import { loadManagedRoom, managedRoom } from '~/lib/api/rooms.server';
import { roomError } from '~/lib/rooms';
import { roomShape } from '~/lib/schemas';

export const useEditedRoom = routeLoader$((event) => loadManagedRoom(event));

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
