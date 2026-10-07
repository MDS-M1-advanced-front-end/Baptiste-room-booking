import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { getRoomsByRoomId, getRoomsByRoomIdAvailability } from '@room-booking/core';
import {
  DayNav,
  SLOT_GRID,
  SlotLabel,
  SlotsHeading,
  slotClass,
} from '~/components/booking/slot-grid';
import { RoomPhoto } from '~/components/room-card/room-card';
import { Alert } from '~/components/ui/alert';
import { ButtonLink } from '~/components/ui/button';
import { CARD, CARD_BODY } from '~/components/ui/card';
import { ChipList } from '~/components/ui/chip-list';
import { BackLink, EmptyState, Meta, MetaItem } from '~/components/ui/page-header';
import { api } from '~/lib/api/client.server';
import { parisToday } from '~/lib/dates';
import { formatRate } from '~/lib/format';
import { isoDate } from '~/lib/url-params';

export const useRoom = routeLoader$(async (event) => {
  const { data } = await getRoomsByRoomId({
    client: api(event),
    path: { roomId: event.params.id },
  });
  if (!data) event.status(404);
  return data ?? null;
});

export const useAvailability = routeLoader$(async (event) => {
  const today = parisToday();
  const requested = isoDate(event.url.searchParams.get('date'));
  const day = requested && requested > today ? requested : today;
  const room = await event.resolveValue(useRoom);
  if (!room) return { today, day, slots: null };
  const { data } = await getRoomsByRoomIdAvailability({
    client: api(event),
    path: { roomId: room.id },
    query: { date: day },
  });
  return { today, day, slots: data ?? null };
});

export default component$(() => {
  const room = useRoom();
  const availability = useAvailability();
  const value = room.value;
  if (!value) {
    return (
      <>
        <BackLink href="/rooms/" label="Retour aux résultats" />
        <EmptyState
          title="Salle introuvable"
          icon="building"
          description="Cette salle n'existe pas ou n'est plus proposée."
        >
          <ButtonLink href="/rooms/" variant="secondary">
            Voir le catalogue
          </ButtonLink>
        </EmptyState>
      </>
    );
  }
  const { today, day, slots } = availability.value;
  return (
    <>
      <BackLink href="/rooms/" label="Retour aux résultats" />
      <div class="grid items-start gap-(--space-5) lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="flex flex-col gap-(--space-6)">
          <RoomPhoto room={value} hero />
          <div class="flex flex-col gap-(--space-2)">
            <h1>{value.name}</h1>
            <Meta>
              <MetaItem icon="pin">{value.location}</MetaItem>
              <MetaItem icon="users">{value.capacity} personnes max</MetaItem>
              <MetaItem icon="euro">{formatRate(value.pricePerHour)} / heure</MetaItem>
            </Meta>
            {value.description && <p>{value.description}</p>}
          </div>
          {value.equipment?.length ? (
            <section aria-labelledby="equipment-title" class="flex flex-col gap-(--space-2)">
              <h2 id="equipment-title">Équipements</h2>
              <ChipList items={value.equipment} />
            </section>
          ) : null}
          <section aria-labelledby="slots-title" class={CARD}>
            <div class={[CARD_BODY, 'flex flex-col gap-(--space-4)']}>
              <h2 id="slots-title">Choisir un créneau</h2>
              <DayNav day={day} min={today} />
              {slots ? (
                <div class="flex flex-col gap-(--space-2)">
                  <SlotsHeading id="slots-label" day={day} />
                  <ul aria-labelledby="slots-label" class={SLOT_GRID}>
                    {slots.map((slot) => (
                      <li
                        key={slot.startTime}
                        aria-disabled={slot.available ? undefined : 'true'}
                        class={slotClass}
                      >
                        <SlotLabel slot={slot} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Alert tone="danger" title="Les créneaux n'ont pas pu être chargés">
                  <p>Le serveur ne répond pas. Choisissez une autre date ou réessayez.</p>
                </Alert>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => ({
  title: resolveValue(useRoom)?.name ?? 'Salle introuvable',
});
