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
  getRoomsByRoomIdAvailability,
  postReservations,
  type AvailabilitySlot,
  type Room,
} from '@room-booking/core';
import { BookingSummary } from '~/components/booking/booking-summary';
import { DayNav, SlotPicker } from '~/components/booking/slot-picker';
import { RoomPhoto } from '~/components/room-card/room-card';
import { Alert } from '~/components/ui/alert';
import { Button, ButtonLink } from '~/components/ui/button';
import { CARD, CARD_BODY } from '~/components/ui/card';
import { ChipList } from '~/components/ui/chip-list';
import { ErrorSummary, collectErrors } from '~/components/ui/error-summary';
import { Field, Textarea, TextField, fieldA11y } from '~/components/ui/field';
import { BackLink, EmptyState, Meta, MetaItem } from '~/components/ui/page-header';
import { api } from '~/lib/api/client.server';
import { currentUser } from '~/lib/auth.server';
import { parisIso, parisToday } from '~/lib/dates';
import { formatRate } from '~/lib/format';
import { reservationError } from '~/lib/reservation-errors';
import { COMMENT_MAX, reservationSchema } from '~/lib/schemas';
import type { SlotRange } from '~/lib/slots';
import { isoDate } from '~/lib/url-params';
import { useCurrentUser } from '~/routes/layout';

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

export const useCreateReservation = routeAction$(async (input, event) => {
  if (!currentUser(event)) return event.fail(401, { message: reservationError(401) });
  const client = api(event);
  const { data: room } = await getRoomsByRoomId({ client, path: { roomId: event.params.id } });
  if (!room) return event.fail(404, { message: reservationError(404) });
  if (input.numberOfParticipants > room.capacity) {
    return event.fail(400, {
      fieldErrors: {
        numberOfParticipants: `La salle accueille ${room.capacity} personnes au maximum.`,
      },
    });
  }
  const { data, response } = await postReservations({
    client,
    body: {
      roomId: room.id,
      startAt: parisIso(input.date, input.startTime),
      endAt: parisIso(input.date, input.endTime),
      numberOfParticipants: input.numberOfParticipants,
      comment: input.comment || undefined,
    },
  });
  if (!data) {
    return event.fail(response?.status ?? 500, { message: reservationError(response?.status) });
  }
  throw event.redirect(303, '/bookings/?status=PENDING');
}, zod$(reservationSchema));

const FIELDS = {
  numberOfParticipants: 'Nombre de participants',
  comment: 'Commentaire',
  startTime: 'Créneau',
  endTime: 'Créneau',
};

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
  const range = selection.value;
  const errors: Partial<Record<string, string>> | undefined = create.value?.fieldErrors;
  return (
    <Form action={create} class="flex flex-col gap-(--space-4)" noValidate>
      <ErrorSummary errors={collectErrors(FIELDS, errors)} action="la réservation" />
      {create.value?.failed && create.value.message && (
        <Alert tone="danger" title="Réservation impossible">
          <p>{create.value.message}</p>
        </Alert>
      )}
      <input type="hidden" name="date" value={day} />
      <input type="hidden" name="startTime" value={range ? slots[range.start].startTime : ''} />
      <input type="hidden" name="endTime" value={range ? slots[range.end].endTime : ''} />
      <TextField
        id="numberOfParticipants"
        label={FIELDS.numberOfParticipants}
        type="number"
        inputMode="numeric"
        min={1}
        max={room.capacity}
        required
        hint={`${room.capacity} personnes maximum`}
        value={create.formData?.get('numberOfParticipants')?.toString()}
        error={errors?.numberOfParticipants}
      />
      <Field id="comment" label={FIELDS.comment} hint="Facultatif" error={errors?.comment}>
        <Textarea
          {...fieldA11y({ id: 'comment', hint: 'Facultatif', error: errors?.comment })}
          rows={3}
          maxLength={COMMENT_MAX}
          value={create.formData?.get('comment')?.toString()}
        />
      </Field>
      <Button type="submit" block disabled={!range} busy={create.isRunning}>
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
                <SlotPicker day={day} slots={slots} selection={selection} />
              ) : (
                <Alert tone="danger" title="Les créneaux n'ont pas pu être chargés">
                  <p>Le serveur ne répond pas. Choisissez une autre date ou réessayez.</p>
                </Alert>
              )}
            </div>
          </section>
        </div>
        <aside
          aria-labelledby="booking-title"
          class={[CARD, 'lg:sticky lg:top-[calc(4rem+var(--space-4))]']}
        >
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
