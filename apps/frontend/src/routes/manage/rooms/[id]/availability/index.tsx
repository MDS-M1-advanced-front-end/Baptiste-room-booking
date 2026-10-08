import { component$, useSignal, useTask$, type QRL } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import {
  putRoomsByRoomIdAvailability,
  type AvailabilitySlot,
} from "@room-booking/core";
import { DayNav, SlotPicker } from "~/components/booking/slot-picker";
import { Alert } from "~/components/ui/alert";
import { Button, ButtonLink } from "~/components/ui/button";
import {
  ASIDE_LAYOUT,
  CARD,
  CARD_BODY,
  STICKY_ASIDE,
} from "~/components/ui/card";
import { Checkbox, Field, Input } from "~/components/ui/field";
import { Icon } from "~/components/ui/icon";
import { BackLink, EmptyState, PageHeader } from "~/components/ui/page-header";
import { loadAvailability } from "~/lib/api/availability.server";
import { api } from "~/lib/api/client.server";
import { loadManagedRoom, managedRoom } from "~/lib/api/rooms.server";
import { parisToday } from "~/lib/dates";
import { formatDay } from "~/lib/format";
import { roomError } from "~/lib/rooms";
import { availabilityShape } from "~/lib/schemas";
import { hourlySlots, nextSlot, type SlotRange } from "~/lib/slots";

export const useManagedRoom = routeLoader$((event) => loadManagedRoom(event));

export const useDayAvailability = routeLoader$(async (event) =>
  loadAvailability(
    event,
    (await event.resolveValue(useManagedRoom))?.id,
    parisToday(),
  ),
);

export const useSaveDay = routeAction$(async (body, event) => {
  const { room, allowed } = await managedRoom(event);
  if (!room || !allowed) {
    const status = room ? 403 : 404;
    return event.fail(status, { message: roomError(status) });
  }
  const { data, response } = await putRoomsByRoomIdAvailability({
    client: api(event),
    path: { roomId: room.id },
    body,
  });
  if (!data) {
    return event.fail(response?.status ?? 500, {
      message: "Les créneaux n'ont pas pu être enregistrés. Réessayez.",
    });
  }
  return { saved: body.date };
}, zod$(availabilityShape));

const SlotRow = component$<{
  index: number;
  slot: AvailabilitySlot;
  onChange$: QRL<(slot: AvailabilitySlot | null) => void>;
}>(({ index, slot, onChange$ }) => (
  <li class="grid grid-cols-2 items-end gap-(--space-3) border-b border-(--color-border) py-(--space-3) md:grid-cols-[1fr_1fr_auto]">
    <Field id={`start-${index}`} label="Début">
      <Input
        id={`start-${index}`}
        type="time"
        step={3600}
        value={slot.startTime}
        onInput$={(_, input) => onChange$({ ...slot, startTime: input.value })}
      />
    </Field>
    <Field id={`end-${index}`} label="Fin">
      <Input
        id={`end-${index}`}
        type="time"
        step={3600}
        value={slot.endTime}
        onInput$={(_, input) => onChange$({ ...slot, endTime: input.value })}
      />
    </Field>
    <div class="col-span-2 flex items-center justify-between gap-(--space-3) md:col-span-1">
      <Checkbox
        label="Réservable"
        checked={slot.available}
        onChange$={(_, input) =>
          onChange$({ ...slot, available: input.checked })
        }
      />
      <Button variant="ghost" size="icon-sm" onClick$={() => onChange$(null)}>
        <Icon name="trash" />
        <span class="sr-only">
          Supprimer le créneau de {slot.startTime} à {slot.endTime}
        </span>
      </Button>
    </div>
  </li>
));

export default component$(() => {
  const room = useManagedRoom();
  const availability = useDayAvailability();
  const save = useSaveDay();
  const slots = useSignal<AvailabilitySlot[]>([]);
  const preview = useSignal<SlotRange | null>(null);
  useTask$(({ track }) => {
    slots.value = track(() => availability.value.slots) ?? [];
  });
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
  const { today, day } = availability.value;
  const failure = save.value?.failed
    ? (save.value.message ??
      save.value.fieldErrors?.slots ??
      save.value.formErrors?.[0])
    : undefined;
  return (
    <>
      <BackLink href="/manage/rooms/" label="Mes salles" />
      <PageHeader
        title="Disponibilités"
        description={`${room.value.name} · ${room.value.location}`}
      />
      <div class={ASIDE_LAYOUT}>
        <section aria-label="Créneaux de la journée" class={CARD}>
          <div class={[CARD_BODY, "flex flex-col gap-(--space-4)"]}>
            <DayNav day={day} min={today} label="Journée" />
            <Alert tone="info">
              <p>
                L'enregistrement remplace tous les créneaux de cette journée.
              </p>
            </Alert>
            {save.value?.saved && (
              <Alert tone="success">
                <p>
                  Les créneaux du {formatDay(save.value.saved)} ont été
                  enregistrés.
                </p>
              </Alert>
            )}
            {failure && (
              <Alert tone="danger" title="Enregistrement impossible">
                <p>{failure}</p>
              </Alert>
            )}
            {availability.value.slots ? null : (
              <Alert
                tone="danger"
                title="Les créneaux n'ont pas pu être chargés"
              >
                <p>
                  Le serveur ne répond pas. Choisissez une autre date ou
                  réessayez.
                </p>
              </Alert>
            )}
            <Form action={save} class="flex flex-col gap-(--space-4)">
              <input type="hidden" name="date" value={day} />
              <input
                type="hidden"
                name="slots"
                value={JSON.stringify(slots.value)}
              />
              <fieldset>
                <legend class="font-(--font-weight-semibold)">
                  Créneaux du {formatDay(day)}
                </legend>
                {slots.value.length ? (
                  <ul>
                    {slots.value.map((slot, index) => (
                      <SlotRow
                        key={index}
                        index={index}
                        slot={slot}
                        onChange$={(next) =>
                          (slots.value = next
                            ? slots.value.map((current, at) =>
                                at === index ? next : current,
                              )
                            : slots.value.filter((_, at) => at !== index))
                        }
                      />
                    ))}
                  </ul>
                ) : (
                  <p class="py-(--space-3) text-(--color-text-muted)">
                    Aucun créneau ouvert ce jour.
                  </p>
                )}
              </fieldset>
              <Button
                variant="ghost"
                class="self-start"
                onClick$={() =>
                  (slots.value = [...slots.value, nextSlot(slots.value)])
                }
              >
                <Icon name="plus" />
                Ajouter un créneau
              </Button>
              <div class="flex justify-end gap-(--space-3) pt-(--space-2) max-md:flex-col-reverse">
                <ButtonLink href="/manage/rooms/" variant="secondary">
                  Annuler
                </ButtonLink>
                <Button type="submit" busy={save.isRunning}>
                  Enregistrer la journée
                </Button>
              </div>
            </Form>
          </div>
        </section>
        <aside aria-labelledby="client-view-title" class={STICKY_ASIDE}>
          <div class={[CARD_BODY, "flex flex-col gap-(--space-3)"]}>
            <h2 id="client-view-title">Vue client</h2>
            <p class="text-(length:--font-size-sm) text-(--color-text-muted)">
              Les créneaux tels qu'ils apparaissent sur la fiche de la salle.
            </p>
            <div inert>
              <SlotPicker
                day={day}
                slots={hourlySlots(slots.value)}
                selection={preview}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => ({
  title: `Disponibilités ${resolveValue(useManagedRoom)?.name ?? ""}`.trim(),
});
