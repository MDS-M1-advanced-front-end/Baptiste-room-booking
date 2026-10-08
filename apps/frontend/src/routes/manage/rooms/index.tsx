import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  z,
  zod$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import {
  deleteRoomsByRoomId,
  getRooms,
  getRoomsByRoomId,
} from "@room-booking/core";
import { RoomPhoto } from "~/components/room-card/room-card";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button, ButtonLink } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Modal } from "~/components/ui/modal";
import { EmptyState, PageHeader } from "~/components/ui/page-header";
import { api } from "~/lib/api/client.server";
import { requireRole } from "~/lib/auth.server";
import { formatAmount } from "~/lib/format";
import { MANAGER_ROLES } from "~/lib/navigation";
import { canManage, ownedRooms } from "~/lib/rooms";

const DELETE_ERRORS: Record<number, string> = {
  403: "Vous n'avez pas les droits pour supprimer cette salle.",
  404: "Cette salle n'existe plus.",
  409: "Cette salle a des réservations en cours : elle ne peut pas être supprimée.",
};

export const useManagedRooms = routeLoader$(async (event) => {
  const user = requireRole(event, MANAGER_ROLES);
  const { data } = await getRooms({
    client: api(event),
    query: { pageSize: 100 },
  });
  return data ? ownedRooms(data.items, user) : null;
});

export const useDeleteRoom = routeAction$(
  async ({ roomId }, event) => {
    const user = requireRole(event, MANAGER_ROLES);
    const client = api(event);
    const { data: room } = await getRoomsByRoomId({ client, path: { roomId } });
    if (!room || !canManage(room, user)) {
      return event.fail(room ? 403 : 404, {
        message: DELETE_ERRORS[room ? 403 : 404],
      });
    }
    const { error, response } = await deleteRoomsByRoomId({
      client,
      path: { roomId },
    });
    if (error || !response?.ok) {
      const status = response?.status ?? 500;
      return event.fail(status, {
        message:
          DELETE_ERRORS[status] ??
          "La salle n'a pas pu être supprimée. Réessayez.",
      });
    }
    return { deleted: room.name };
  },
  zod$({ roomId: z.string().uuid() }),
);

const cell =
  "px-(--space-4) py-(--space-3) max-md:flex max-md:justify-between max-md:gap-(--space-4) max-md:px-0 max-md:py-(--space-1)";
const labelled = `${cell} max-md:before:text-(--color-text-muted) max-md:before:content-[attr(data-label)]`;
const num = "text-right tabular-nums";

export default component$(() => {
  const rooms = useManagedRooms();
  const remove = useDeleteRoom();
  const open = useSignal(false);
  const selected = useSignal<{ id: string; name: string } | null>(null);
  useTask$(({ track }) => {
    if (track(() => remove.value?.deleted)) open.value = false;
  });
  const items = rooms.value;
  return (
    <>
      <PageHeader
        title="Mes salles"
        description={
          items
            ? `${items.length} salle${items.length > 1 ? "s" : ""} dont vous êtes gestionnaire.`
            : undefined
        }
      >
        <ButtonLink href="/manage/rooms/new/">
          <Icon name="plus" />
          Ajouter une salle
        </ButtonLink>
      </PageHeader>
      {remove.value?.deleted && (
        <Alert tone="success">
          <p>La salle « {remove.value.deleted} » a été supprimée.</p>
        </Alert>
      )}
      {!items ? (
        <Alert tone="danger" title="Vos salles n'ont pas pu être chargées">
          <p>
            Le serveur ne répond pas. Rechargez la page dans quelques instants.
          </p>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucune salle pour le moment"
          icon="building"
          description="Ajoutez votre première salle pour la proposer à la réservation."
        />
      ) : (
        <div class="mt-(--space-4) overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)">
          <table class="w-full border-collapse text-(length:--font-size-sm)">
            <caption class="sr-only">Mes salles</caption>
            <thead class="bg-(--color-bg) text-(--color-text-muted) max-md:sr-only">
              <tr>
                <th scope="col" class={[cell, "text-left"]}>
                  Salle
                </th>
                <th scope="col" class={[cell, num]}>
                  Capacité
                </th>
                <th scope="col" class={[cell, num]}>
                  Tarif
                </th>
                <th scope="col" class={[cell, "text-left"]}>
                  Statut
                </th>
                <th scope="col" class={cell}>
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((room) => (
                <tr
                  key={room.id}
                  class="border-t border-(--color-border) max-md:block max-md:px-(--space-4) max-md:py-(--space-3) max-md:first:border-t-0"
                >
                  <th
                    scope="row"
                    class={[
                      cell,
                      "text-left font-(--font-weight-regular) max-md:pb-(--space-2)",
                    ]}
                  >
                    <span class="flex items-center gap-(--space-3)">
                      <RoomPhoto room={room} variant="thumb" />
                      <span>
                        <Link
                          href={`/rooms/${room.id}/`}
                          class="font-(--font-weight-semibold)"
                        >
                          {room.name}
                        </Link>
                        <br />
                        <span class="text-(--color-text-muted)">
                          {room.location}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td data-label="Capacité" class={[labelled, num]}>
                    {room.capacity} pers.
                  </td>
                  <td data-label="Tarif" class={[labelled, num]}>
                    {formatAmount(room.pricePerHour)} / h
                  </td>
                  <td data-label="Statut" class={labelled}>
                    {room.status === "ACTIVE" ? (
                      <Badge tone="confirmed">Active</Badge>
                    ) : (
                      <Badge tone="neutral">Inactive</Badge>
                    )}
                  </td>
                  <td class={[cell, "max-md:pt-(--space-2)"]}>
                    <span class="flex flex-wrap items-center justify-end gap-(--space-2)">
                      <ButtonLink
                        href={`/manage/rooms/${room.id}/availability/`}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="calendar" />
                        Disponibilités
                      </ButtonLink>
                      <ButtonLink
                        href={`/manage/rooms/${room.id}/edit/`}
                        variant="ghost"
                        size="icon-sm"
                      >
                        <Icon name="pencil" />
                        <span class="sr-only">Modifier {room.name}</span>
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick$={() => {
                          selected.value = { id: room.id, name: room.name };
                          open.value = true;
                        }}
                      >
                        <Icon name="trash" />
                        <span class="sr-only">Supprimer {room.name}</span>
                      </Button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={open}
        title={`Supprimer ${selected.value?.name ?? "la salle"} ?`}
      >
        <p>La salle disparaîtra du catalogue. Cette action est définitive.</p>
        {remove.value?.failed && (
          <Alert tone="danger" title="Suppression impossible">
            <p>{remove.value.message}</p>
          </Alert>
        )}
        <Button
          q:slot="footer"
          variant="secondary"
          onClick$={() => (open.value = false)}
        >
          Conserver
        </Button>
        <Form q:slot="footer" action={remove} class="contents">
          <input type="hidden" name="roomId" value={selected.value?.id} />
          <Button type="submit" variant="danger" busy={remove.isRunning}>
            Supprimer la salle
          </Button>
        </Form>
      </Modal>
    </>
  );
});

export const head: DocumentHead = { title: "Mes salles" };
