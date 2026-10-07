import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import {
  getReservationsByReservationId,
  getRoomsByRoomId,
  patchReservationsByReservationId,
  type Client,
} from "@room-booking/core";
import {
  BOOKING_FIELDS,
  BookingFields,
} from "~/components/booking/booking-fields";
import { BookingSummary } from "~/components/booking/booking-summary";
import { SlotCard } from "~/components/booking/slot-picker";
import { Alert } from "~/components/ui/alert";
import { StatusBadge } from "~/components/ui/badge";
import { Button, ButtonLink } from "~/components/ui/button";
import { ASIDE_LAYOUT, CARD_BODY, STICKY_ASIDE } from "~/components/ui/card";
import { ErrorSummary, collectErrors } from "~/components/ui/error-summary";
import { BackLink, EmptyState, PageHeader } from "~/components/ui/page-header";
import { loadAvailability } from "~/lib/api/availability.server";
import { api } from "~/lib/api/client.server";
import { requireUser } from "~/lib/auth.server";
import { canEdit, slotLabel } from "~/lib/bookings";
import { capacityError, reservationTimes } from "~/lib/booking-request";
import { parisToday } from "~/lib/dates";
import { formatAmount, formatParis } from "~/lib/format";
import { reservationError } from "~/lib/reservation-errors";
import { reservationSchema } from "~/lib/schemas";
import { rangeOf, withOwnSlots, type SlotRange } from "~/lib/slots";

const BOOKINGS = "/bookings/";

async function ownBooking(
  client: Client,
  reservationId: string,
  userId: string,
) {
  const { data: reservation } = await getReservationsByReservationId({
    client,
    path: { reservationId },
  });
  if (!reservation || reservation.userId !== userId) return null;
  const { data: room } = await getRoomsByRoomId({
    client,
    path: { roomId: reservation.roomId },
  });
  return room ? { reservation, room } : null;
}

export const useBooking = routeLoader$(async (event) => {
  const booking = await ownBooking(
    api(event),
    event.params.id,
    requireUser(event).id,
  );
  if (!booking) {
    event.status(404);
    return null;
  }
  const { reservation } = booking;
  return {
    ...booking,
    editable: canEdit(reservation, new Date()),
    day: parisToday(new Date(reservation.startAt)),
    start: formatParis(reservation.startAt, "time"),
    end: formatParis(reservation.endAt, "time"),
  };
});

export const useAvailability = routeLoader$(async (event) => {
  const booking = await event.resolveValue(useBooking);
  const availability = await loadAvailability(
    event,
    booking?.room.id,
    booking?.day ?? parisToday(),
  );
  return booking && availability.slots && availability.day === booking.day
    ? {
        ...availability,
        slots: withOwnSlots(availability.slots, booking.start, booking.end),
      }
    : availability;
});

export const useUpdateReservation = routeAction$(async (input, event) => {
  const client = api(event);
  const booking = await ownBooking(
    client,
    event.params.id,
    requireUser(event).id,
  );
  if (!booking)
    return event.fail(404, { message: reservationError(404), conflict: false });
  if (!canEdit(booking.reservation, new Date())) {
    return event.fail(403, {
      message: "Cette réservation ne peut plus être modifiée.",
      conflict: false,
    });
  }
  const tooMany = capacityError(
    booking.room.capacity,
    input.numberOfParticipants,
  );
  if (tooMany)
    return event.fail(400, { fieldErrors: { numberOfParticipants: tooMany } });
  const { data, response } = await patchReservationsByReservationId({
    client,
    path: { reservationId: booking.reservation.id },
    body: reservationTimes(input),
  });
  if (!data) {
    const status = response?.status ?? 500;
    return event.fail(status, {
      message: reservationError(status),
      conflict: status === 409,
    });
  }
  throw event.redirect(303, BOOKINGS);
}, zod$(reservationSchema));

export default component$(() => {
  const booking = useBooking();
  const availability = useAvailability();
  const update = useUpdateReservation();
  const selection = useSignal<SlotRange | null>(null);
  useTask$(({ track }) => {
    const { day, slots } = track(() => availability.value);
    const value = booking.value;
    selection.value =
      value && slots && day === value.day
        ? rangeOf(slots, value.start, value.end)
        : null;
  });
  const value = booking.value;
  if (!value) {
    return (
      <>
        <BackLink href={BOOKINGS} label="Mes réservations" />
        <EmptyState
          title="Réservation introuvable"
          icon="calendar"
          description="Cette réservation n'existe pas ou ne vous appartient pas."
        >
          <ButtonLink href={BOOKINGS} variant="secondary">
            Voir mes réservations
          </ButtonLink>
        </EmptyState>
      </>
    );
  }
  const { reservation, room } = value;
  const { today, day, slots } = availability.value;
  const errors: Partial<Record<string, string>> | undefined =
    update.value?.fieldErrors;
  const field = (name: string, fallback?: string | number) =>
    update.formData?.get(name)?.toString() ?? fallback?.toString();
  return (
    <>
      <BackLink href={BOOKINGS} label="Mes réservations" />
      <PageHeader
        title="Modifier ma réservation"
        description={`${room.name} · ${room.location} · ${room.capacity} personnes max`}
      >
        <StatusBadge status={reservation.status} />
      </PageHeader>
      {!value.editable ? (
        <Alert tone="info" title="Modification impossible">
          <p>
            Cette réservation est passée, refusée ou annulée : elle ne peut plus
            être modifiée.
          </p>
        </Alert>
      ) : (
        <div class={ASIDE_LAYOUT}>
          <div class="flex flex-col gap-(--space-6)">
            {update.value?.conflict && (
              <Alert tone="danger" title="Ce créneau n'est plus disponible">
                <p>
                  Une autre réservation a été enregistrée entre-temps.
                  Choisissez un autre horaire, vos autres modifications sont
                  conservées.
                </p>
              </Alert>
            )}
            <SlotCard
              title="Nouveau créneau"
              today={today}
              day={day}
              slots={slots}
              selection={selection}
            />
          </div>
          <aside aria-labelledby="recap-title" class={STICKY_ASIDE}>
            <Form
              action={update}
              class={[CARD_BODY, "flex flex-col gap-(--space-4)"]}
              noValidate
            >
              <h2 id="recap-title">Récapitulatif</h2>
              <BookingSummary
                day={day}
                slots={slots ?? []}
                selection={selection}
                pricePerHour={room.pricePerHour}
                before={`${slotLabel(reservation)} · ${formatAmount(reservation.totalAmount)}`}
              />
              <ErrorSummary
                errors={collectErrors(BOOKING_FIELDS, errors)}
                action="l'enregistrement"
              />
              {update.value?.failed &&
                update.value.message &&
                !update.value.conflict && (
                  <Alert tone="danger" title="Modification impossible">
                    <p>{update.value.message}</p>
                  </Alert>
                )}
              <BookingFields
                day={day}
                slots={slots ?? []}
                selection={selection}
                capacity={room.capacity}
                errors={errors}
                participants={field(
                  "numberOfParticipants",
                  reservation.numberOfParticipants,
                )}
                comment={field("comment", reservation.comment)}
              />
              <div class="flex flex-col gap-(--space-2)">
                <Button
                  type="submit"
                  block
                  disabled={!selection.value}
                  busy={update.isRunning}
                >
                  Enregistrer les modifications
                </Button>
                <ButtonLink href={BOOKINGS} variant="ghost" block>
                  Abandonner
                </ButtonLink>
              </div>
            </Form>
          </aside>
        </div>
      )}
    </>
  );
});

export const head: DocumentHead = { title: "Modifier ma réservation" };
