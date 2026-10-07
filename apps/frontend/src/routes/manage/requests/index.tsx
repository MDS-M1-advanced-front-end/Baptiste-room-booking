import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
  type DocumentHead,
  type RequestEventAction,
} from "@builder.io/qwik-city";
import {
  getReservations,
  postReservationsByReservationIdConfirm,
  postReservationsByReservationIdReject,
  type Reservation,
  type User,
} from "@room-booking/core";
import {
  ReservationItem,
  ReservationList,
} from "~/components/booking/reservation-item";
import { Alert } from "~/components/ui/alert";
import { Count } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Field, Textarea, fieldA11y } from "~/components/ui/field";
import { Icon } from "~/components/ui/icon";
import { Modal } from "~/components/ui/modal";
import { EmptyState, PageHeader } from "~/components/ui/page-header";
import { api } from "~/lib/api/client.server";
import {
  managedReservation,
  roomsById,
  usersById,
} from "~/lib/api/rooms.server";
import { requireRole } from "~/lib/auth.server";
import { slotSentence, splitRequests } from "~/lib/bookings";
import { formatParis } from "~/lib/format";
import { MANAGER_ROLES } from "~/lib/navigation";
import { reservationError } from "~/lib/reservation-errors";

const fullName = (user?: Pick<User, "firstName" | "lastName">) =>
  user ? `${user.firstName} ${user.lastName}` : "un utilisateur inconnu";

export const useRequests = routeLoader$(async (event) => {
  requireRole(event, MANAGER_ROLES);
  const client = api(event);
  const { data } = await getReservations({ client, query: { pageSize: 100 } });
  if (!data) return null;
  const [rooms, users] = await Promise.all([
    roomsById(
      client,
      data.items.map((item) => item.roomId),
    ),
    usersById(
      client,
      data.items.map((item) => item.userId),
    ),
  ]);
  const names = Object.fromEntries(
    Object.values(users).map((user) => [user.id, fullName(user)]),
  );
  return { ...splitRequests(data.items), rooms, names };
});

type Decision = "confirm" | "reject";

async function decide(
  event: RequestEventAction,
  decision: Decision,
  reservationId: string,
  reason?: string,
) {
  const target = await managedReservation(event, reservationId);
  if (target.status !== 200) {
    return event.fail(target.status, {
      message: reservationError(target.status),
    });
  }
  const client = api(event);
  const path = { reservationId };
  const { error, response } =
    decision === "confirm"
      ? await postReservationsByReservationIdConfirm({ client, path })
      : await postReservationsByReservationIdReject({
          client,
          path,
          body: reason ? { reason } : undefined,
        });
  if (error || !response?.ok) {
    const status = response?.status ?? 500;
    return event.fail(status, {
      message:
        status === 409
          ? "Cette demande a déjà été traitée."
          : reservationError(status),
    });
  }
  const { reservation, room, requester } = target;
  const verb = decision === "confirm" ? "confirmée" : "refusée";
  return {
    decided: `Réservation de ${fullName(requester)} ${verb} (${room.name}, ${formatParis(reservation.startAt, "date")}).`,
  };
}

const reservationId = z.string().uuid();

export const useConfirm = routeAction$(
  ({ reservationId }, event) => decide(event, "confirm", reservationId),
  zod$({ reservationId }),
);

export const useReject = routeAction$(
  ({ reservationId, reason }, event) =>
    decide(event, "reject", reservationId, reason?.trim()),
  zod$({ reservationId, reason: z.string().max(500).optional() }),
);

export default component$(() => {
  const requests = useRequests();
  const confirm = useConfirm();
  const reject = useReject();
  const open = useSignal(false);
  const selected = useSignal<{ id: string; summary: string } | null>(null);
  useTask$(({ track }) => {
    if (track(() => reject.value?.decided)) open.value = false;
  });
  const value = requests.value;
  const decided = confirm.value?.decided ?? reject.value?.decided;

  const item = (reservation: Reservation, pending: boolean) => {
    const room = value?.rooms[reservation.roomId]?.name;
    const requester = value?.names[reservation.userId] ?? fullName();
    return (
      <ReservationItem
        key={reservation.id}
        reservation={reservation}
        roomName={room}
      >
        <p class="text-(length:--font-size-sm)">
          Demande de <strong>{requester}</strong>
        </p>
        {pending && (
          <>
            <Form q:slot="actions" action={confirm} class="contents">
              <input
                type="hidden"
                name="reservationId"
                value={reservation.id}
              />
              <Button type="submit" size="sm">
                <Icon name="check" />
                Confirmer
              </Button>
            </Form>
            <Button
              q:slot="actions"
              variant="secondary"
              size="sm"
              onClick$={() => {
                selected.value = {
                  id: reservation.id,
                  summary: `${room ?? "Salle"}, ${slotSentence(reservation)}, pour ${requester}.`,
                };
                open.value = true;
              }}
            >
              <Icon name="x" />
              Refuser
            </Button>
          </>
        )}
      </ReservationItem>
    );
  };

  return (
    <>
      <PageHeader
        title="Demandes de réservation"
        description="Confirmez ou refusez les demandes sur vos salles."
      />
      {decided && (
        <Alert tone="success">
          <p>{decided}</p>
        </Alert>
      )}
      {confirm.value?.failed && (
        <Alert tone="danger" title="Confirmation impossible">
          <p>{confirm.value.message}</p>
        </Alert>
      )}
      {!value ? (
        <Alert tone="danger" title="Les demandes n'ont pas pu être chargées">
          <p>
            Le serveur ne répond pas. Rechargez la page dans quelques instants.
          </p>
        </Alert>
      ) : value.pending.length + value.handled.length === 0 ? (
        <EmptyState
          title="Aucune demande pour le moment"
          icon="calendar"
          description="Les demandes de réservation sur vos salles apparaîtront ici."
        />
      ) : (
        <div class="flex flex-col gap-(--space-6)">
          <section
            aria-labelledby="pending-title"
            class="flex flex-col gap-(--space-4)"
          >
            <h2 id="pending-title" class="flex items-center gap-(--space-2)">
              En attente <Count value={value.pending.length} />
            </h2>
            {value.pending.length > 0 ? (
              <ReservationList>
                {value.pending.map((r) => item(r, true))}
              </ReservationList>
            ) : (
              <p class="text-(--color-text-muted)">
                Aucune demande en attente.
              </p>
            )}
          </section>
          {value.handled.length > 0 && (
            <section
              aria-labelledby="handled-title"
              class="flex flex-col gap-(--space-4)"
            >
              <h2 id="handled-title">Traitées récemment</h2>
              <ReservationList>
                {value.handled.map((r) => item(r, false))}
              </ReservationList>
            </section>
          )}
        </div>
      )}
      <Modal open={open} title="Refuser la demande ?">
        <p>{selected.value?.summary}</p>
        <Form id="reject-form" action={reject} class="contents">
          <input
            type="hidden"
            name="reservationId"
            value={selected.value?.id}
          />
          <Field
            id="reason"
            label="Motif (facultatif)"
            hint="Envoyé avec le refus."
          >
            <Textarea
              {...fieldA11y({ id: "reason", hint: "Envoyé avec le refus." })}
              rows={3}
            />
          </Field>
        </Form>
        {reject.value?.failed && (
          <Alert tone="danger" title="Refus impossible">
            <p>{reject.value.message}</p>
          </Alert>
        )}
        <Button
          q:slot="footer"
          variant="secondary"
          onClick$={() => (open.value = false)}
        >
          Conserver la demande
        </Button>
        <Button
          q:slot="footer"
          type="submit"
          form="reject-form"
          variant="danger"
          busy={reject.isRunning}
        >
          Refuser la demande
        </Button>
      </Modal>
    </>
  );
});

export const head: DocumentHead = { title: "Demandes de réservation" };
