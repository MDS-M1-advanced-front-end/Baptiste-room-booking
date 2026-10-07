import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { RoomCard, type RoomProps } from '~/components/room-card/room-card';
import rooms from '../../../../mock/data/rooms.json';

export default component$(() => {
  return (
    <main class="mx-auto max-w-(--size-container) p-(--space-4)">
      <h1 class="mb-(--space-5) text-(length:--font-size-2xl) font-(--font-weight-bold)">Salles</h1>
      <ul class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-(--space-4)">
        {(rooms as RoomProps[]).map((room) => (
          <li key={room.id}>
            <RoomCard room={room} />
          </li>
        ))}
      </ul>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Quorum',
};
