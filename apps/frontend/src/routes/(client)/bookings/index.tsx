import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  useLocation,
  z,
  zod$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import {
  deleteReservationsByReservationId,
  getReservations,
  type Reservation,
} from "@room-booking/core";
import {
  ReservationItem,
  ReservationList,
} from "~/components/booking/reservation-item";
import { Alert } from "~/components/ui/alert";
import { RESERVATION_STATUS_LABELS } from "~/components/ui/badge";
import { Button, ButtonLink } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Modal } from "~/components/ui/modal";
import { EmptyState, PageHeader } from "~/components/ui/page-header";
import { Segmented } from "~/components/ui/segmented";
import { api } from "~/lib/api/client.server";
import { roomsById } from "~/lib/api/rooms.server";
import { requireUser } from "~/lib/auth.server";
import { canEdit, slotSentence, splitByTime } from "~/lib/bookings";
import { reservationError } from "~/lib/reservation-errors";
import { RESERVATION_STATUSES, parseStatus } from "~/lib/url-params";

const TAB_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmées",
  COMPLETED: "Terminées",
  CANCELLED: "Annulées",
  REJECTED: "Refusées",
};

export const useBookings = routeLoader$(async (event) => {
  const status = parseStatus(event.url.searchParams.get("status"));
  const client = api(event);
  const { data } = await getReservations({
    client,
    query: { status, pageSize: 100 },
  });
  if (!data) return { status, failed: true as const };
  const rooms = await roomsById(
    client,
    data.items.map((item) => item.roomId),
  );
  return {
    status,
    failed: false as const,
    ...splitByTime(data.items, new Date()),
    rooms,
    now: Date.now(),
  };
});

export const useCancelReservation = routeAction$(
  async ({ reservationId }, event) => {
    requireUser(event);
    const { error, response } = await deleteReservationsByReservationId({
      client: api(event),
      path: { reservationId },
    });
    if (error || !response?.ok) {
      return event.fail(response?.status ?? 500, {
        message: reservationError(response?.status),
      });
    }
    return { cancelled: true };
  },
  zod$({ reservationId: z.string().uuid() }),
);

export default component$(() => {
  const bookings = useBookings();
  const cancel = useCancelReservation();
  const { url } = useLocation();
  const open = useSignal(false);
  const selected = useSignal<{ id: string; room: string; when: string } | null>(
    null,
  );
  useTask$(({ track }) => {
    if (track(() => cancel.value?.cancelled)) open.value = false;
  });
  const value = bookings.value;
  const tabs = [
    { label: "Toutes", href: url.pathname, current: !value.status },
    ...RESERVATION_STATUSES.map((status) => ({
      label: TAB_LABELS[status],
      href: `${url.pathname}?status=${status}`,
      current: value.status === status,
    })),
  ];

  const item = (reservation: Reservation, past: boolean) => {
    const name = value.failed
      ? undefined
      : value.rooms[reservation.roomId]?.name;
    return (
      <ReservationItem
        key={reservation.id}
        reservation={reservation}
        roomName={name}
        past={past}
      >
        {!value.failed && canEdit(reservation, new Date(value.now)) && (
          <>
            <ButtonLink
              q:slot="actions"
              href={`/bookings/${reservation.id}/edit/`}
              variant="ghost"
              size="sm"
            >
              <Icon name="pencil" />
              Modifier
            </ButtonLink>
            <Button
              q:slot="actions"
              variant="secondary"
              size="sm"
              onClick$={() => {
                selected.value = {
                  id: reservation.id,
                  room: name ?? "Salle",
                  when: slotSentence(reservation),
                };
                open.value = true;
              }}
            >
              Annuler
            </Button>
          </>
        )}
      </ReservationItem>
    );
  };

  return (
    <>
      <PageHeader
        title="Mes réservations"
        description="Suivez vos demandes et modifiez-les tant qu'elles ne sont pas passées."
      >
        <ButtonLink href="/rooms/">
          <Icon name="plus" />
          Réserver une salle
        </ButtonLink>
      </PageHeader>
      <Segmented label="Filtrer par statut" items={tabs} />
      {cancel.value?.cancelled && (
        <Alert tone="success">
          <p>La réservation a été annulée.</p>
        </Alert>
      )}
      {value.failed ? (
        <Alert
          tone="danger"
          title="Vos réservations n'ont pas pu être chargées"
        >
          <p>
            Le serveur ne répond pas. Rechargez la page dans quelques instants.
          </p>
        </Alert>
      ) : value.upcoming.length + value.past.length === 0 ? (
        <EmptyState
          title={
            value.status
              ? `Aucune réservation « ${RESERVATION_STATUS_LABELS[value.status]} »`
              : "Aucune réservation pour le moment"
          }
          icon="calendar"
          description="Trouvez une salle dans le catalogue et choisissez un créneau."
        >
          <ButtonLink href="/rooms/" variant="secondary">
            Parcourir le catalogue
          </ButtonLink>
        </EmptyState>
      ) : (
        <div class="flex flex-col gap-(--space-6)">
          {value.upcoming.length > 0 && (
            <section
              aria-labelledby="upcoming-title"
              class="flex flex-col gap-(--space-4)"
            >
              <h2 id="upcoming-title">À venir</h2>
              <ReservationList>
                {value.upcoming.map((r) => item(r, false))}
              </ReservationList>
            </section>
          )}
          {value.past.length > 0 && (
            <section
              aria-labelledby="past-title"
              class="flex flex-col gap-(--space-4)"
            >
              <h2 id="past-title">Passées, refusées ou annulées</h2>
              <ReservationList>
                {value.past.map((r) => item(r, true))}
              </ReservationList>
            </section>
          )}
        </div>
      )}
      <Modal open={open} title="Annuler cette réservation ?">
        <p>
          <strong>{selected.value?.room}</strong>, {selected.value?.when}.
        </p>
        <p class="text-(--color-text-muted)">
          Le créneau sera libéré pour d'autres personnes. Cette action est
          définitive.
        </p>
        {cancel.value?.failed && (
          <Alert tone="danger" title="Annulation impossible">
            <p>{cancel.value.message}</p>
          </Alert>
        )}
        <Button
          q:slot="footer"
          variant="secondary"
          onClick$={() => (open.value = false)}
        >
          Conserver
        </Button>
        <Form q:slot="footer" action={cancel} class="contents">
          <input
            type="hidden"
            name="reservationId"
            value={selected.value?.id}
          />
          <Button type="submit" variant="danger" busy={cancel.isRunning}>
            Annuler la réservation
          </Button>
        </Form>
      </Modal>
    </>
  );
});

export const head: DocumentHead = { title: "Mes réservations" };
