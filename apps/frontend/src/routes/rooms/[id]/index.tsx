import { component$, useSignal, useTask$, type Signal } from '@builder.io/qwik';
import {
  Form,
  routeAction$,
  routeLoader$,
  useLocation,
  zod$,
  type DocumentHead,
} from '@builder.io/qwik-city';
import {
  getRoomsByRoomId,
  postReservations,
  type AvailabilitySlot,
  type Room,
} from '@room-booking/core';
import { BOOKING_FIELDS, BookingFields } from '~/components/booking/booking-fields';
import { BookingSummary } from '~/components/booking/booking-summary';
import { SlotCard } from '~/components/booking/slot-picker';
import { RoomPhoto } from '~/components/room-card/room-card';
import { Alert } from '~/components/ui/alert';
import { Button, ButtonLink } from '~/components/ui/button';
import { ASIDE_LAYOUT, CARD_BODY, STICKY_ASIDE } from '~/components/ui/card';
import { ChipList } from '~/components/ui/chip-list';
import { ErrorSummary, collectErrors } from '~/components/ui/error-summary';
import { BackLink, EmptyState, Meta, MetaItem } from '~/components/ui/page-header';
import { loadAvailability } from '~/lib/api/availability.server';
import { api } from '~/lib/api/client.server';
import { currentUser } from '~/lib/auth.server';
import { capacityError, reservationTimes } from '~/lib/booking-request';
import { parisToday } from '~/lib/dates';
import { formatRate } from '~/lib/format';
import { reservationError } from '~/lib/reservation-errors';
import { reservationSchema } from '~/lib/schemas';
import type { SlotRange } from '~/lib/slots';
import { useCurrentUser } from '~/routes/layout';

export const useRoom = routeLoader$(async (event) => {
  const { data } = await getRoomsByRoomId({
    client: api(event),
    path: { roomId: event.params.id },
  });
  if (!data) event.status(404);
  return data ?? null;
});

export const useAvailability = routeLoader$(async (event) =>
  loadAvailability(event, (await event.resolveValue(useRoom))?.id, parisToday()),
);

export const useCreateReservation = routeAction$(async (input, event) => {
  if (!currentUser(event)) return event.fail(401, { message: reservationError(401) });
  const client = api(event);
  const { data: room } = await getRoomsByRoomId({ client, path: { roomId: event.params.id } });
  if (!room) return event.fail(404, { message: reservationError(404) });
  const tooMany = capacityError(room.capacity, input.numberOfParticipants);
  if (tooMany) return event.fail(400, { fieldErrors: { numberOfParticipants: tooMany } });
  const { data, response } = await postReservations({
    client,
    body: { roomId: room.id, ...reservationTimes(input) },
  });
  if (!data) {
    return event.fail(response?.status ?? 500, { message: reservationError(response?.status) });
  }
  throw event.redirect(303, '/bookings/?status=PENDING');
}, zod$(reservationSchema));

const BookingForm = component$<{
  room: Room;
  day: string;
  slots: AvailabilitySlot[];
  selection: Signal<SlotRange | null>;
}>(({ room, day, slots, selection }) => {
  const user = useCurrentUser();
  const create = useCreateReservation();
  const { url } = useLocation();
  if (room.status === 'INACTIVE') {
    return (
      <Alert tone="info" title="Salle indisponible">
        <p>Cette salle n'est pas réservable pour le moment.</p>
      </Alert>
    );
  }
  if (!user.value) {
    return (
      <ButtonLink href={`/login/?redirect=${encodeURIComponent(url.pathname + url.search)}`} block>
        Se connecter pour réserver
      </ButtonLink>
    );
  }
  const errors: Partial<Record<string, string>> | undefined = create.value?.fieldErrors;
  return (
    <Form action={create} class="flex flex-col gap-(--space-4)" noValidate>
      <ErrorSummary errors={collectErrors(BOOKING_FIELDS, errors)} action="la réservation" />
      {create.value?.failed && create.value.message && (
        <Alert tone="danger" title="Réservation impossible">
          <p>{create.value.message}</p>
        </Alert>
      )}
      <BookingFields
        day={day}
        slots={slots}
        selection={selection}
        capacity={room.capacity}
        errors={errors}
        participants={create.formData?.get('numberOfParticipants')?.toString()}
        comment={create.formData?.get('comment')?.toString()}
      />
      <Button type="submit" block disabled={!selection.value} busy={create.isRunning}>
        Demander la réservation
      </Button>
      <p class="text-(length:--font-size-sm) text-(--color-text-muted)">
        Votre demande est transmise au gestionnaire de la salle. Le montant définitif s'affiche dans
        « Mes réservations ».
      </p>
    </Form>
  );
});

export default component$(() => {
  const room = useRoom();
  const availability = useAvailability();
  const selection = useSignal<SlotRange | null>(null);
  useTask$(({ track }) => {
    track(() => availability.value.day);
    selection.value = null;
  });
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
      <div class={ASIDE_LAYOUT}>
        <div class="flex flex-col gap-(--space-6)">
          <RoomPhoto room={value} variant="hero" />
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
          <SlotCard
            title="Choisir un créneau"
            today={today}
            day={day}
            slots={slots}
            selection={selection}
          />
        </div>
        <aside aria-labelledby="booking-title" class={STICKY_ASIDE}>
          <div class={[CARD_BODY, 'flex flex-col gap-(--space-4)']}>
            <h2 id="booking-title">Votre réservation</h2>
            <BookingSummary
              day={day}
              slots={slots ?? []}
              selection={selection}
              pricePerHour={value.pricePerHour}
            />
            <BookingForm room={value} day={day} slots={slots ?? []} selection={selection} />
          </div>
        </aside>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => ({
  title: resolveValue(useRoom)?.name ?? 'Salle introuvable',
});
