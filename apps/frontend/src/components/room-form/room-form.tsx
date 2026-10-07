import { component$, useSignal } from '@builder.io/qwik';
import { Form, type ActionStore, type z } from '@builder.io/qwik-city';
import type { Room } from '@room-booking/core';
import { RoomCard } from '~/components/room-card/room-card';
import { Alert } from '~/components/ui/alert';
import { Button, ButtonLink } from '~/components/ui/button';
import { ASIDE_LAYOUT, CARD, CARD_BODY } from '~/components/ui/card';
import { ErrorSummary, collectErrors } from '~/components/ui/error-summary';
import { Checkbox, Field, Textarea, TextField, fieldA11y } from '~/components/ui/field';
import { BackLink, PageHeader } from '~/components/ui/page-header';
import { ROOM_EQUIPMENT, roomPreview } from '~/lib/rooms';
import type { roomShape } from '~/lib/schemas';

const FIELDS = {
  name: 'Nom',
  description: 'Description',
  location: 'Lieu',
  capacity: 'Capacité',
  pricePerHour: 'Tarif horaire',
  imageUrl: 'Adresse de la photo',
};

export type RoomFormAction = ActionStore<
  { failed?: boolean; message?: string; fieldErrors?: Partial<Record<string, string>> },
  z.input<z.ZodObject<typeof roomShape>>,
  boolean
>;

export const RoomForm = component$<{ title: string; room?: Room; action: RoomFormAction }>(
  ({ title, room, action }) => {
    const sent = action.formData;
    const preview = useSignal(() =>
      sent ? roomPreview(sent, room) : (room ?? roomPreview(new FormData())),
    );
    const errors = action.value?.fieldErrors;
    const value = (name: keyof typeof FIELDS) => sent?.get(name)?.toString() ?? room?.[name];
    const equipped = (item: string) =>
      sent ? sent.getAll('equipment[]').includes(item) : !!room?.equipment?.includes(item);
    return (
      <>
        <BackLink href="/manage/rooms/" label="Mes salles" />
        <PageHeader
          title={title}
          description="Les champs marqués d'un astérisque (*) sont obligatoires."
        />
        <div class={ASIDE_LAYOUT}>
          <Form
            action={action}
            class={[CARD, CARD_BODY, 'flex flex-col gap-(--space-4)']}
            noValidate
            onInput$={(_, form) => (preview.value = roomPreview(new FormData(form), room))}
          >
            <ErrorSummary errors={collectErrors(FIELDS, errors)} action="l'enregistrement" />
            {action.value?.failed && action.value.message && (
              <Alert tone="danger" title="Enregistrement impossible">
                <p>{action.value.message}</p>
              </Alert>
            )}
            <TextField
              id="name"
              label={FIELDS.name}
              required
              value={value('name')}
              error={errors?.name}
            />
            <Field id="description" label={FIELDS.description} error={errors?.description}>
              <Textarea
                {...fieldA11y({ id: 'description', error: errors?.description })}
                rows={3}
                value={value('description')}
              />
            </Field>
            <TextField
              id="location"
              label={FIELDS.location}
              required
              value={value('location')}
              error={errors?.location}
            />
            <div class="grid gap-(--space-4) md:grid-cols-2">
              <TextField
                id="capacity"
                label={FIELDS.capacity}
                type="number"
                min={1}
                inputMode="numeric"
                suffix="pers."
                required
                value={value('capacity')}
                error={errors?.capacity}
              />
              <TextField
                id="pricePerHour"
                label={FIELDS.pricePerHour}
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                suffix="€ / h"
                required
                value={value('pricePerHour')}
                error={errors?.pricePerHour}
              />
            </div>
            <fieldset class="flex flex-col gap-(--space-2)">
              <legend class="mb-(--space-2) font-(--font-weight-semibold)">Équipements</legend>
              <div class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-(--space-4)">
                {ROOM_EQUIPMENT.map((item) => (
                  <Checkbox
                    key={item}
                    name="equipment[]"
                    value={item}
                    label={item}
                    checked={equipped(item)}
                  />
                ))}
              </div>
            </fieldset>
            <TextField
              id="imageUrl"
              label={FIELDS.imageUrl}
              type="url"
              placeholder="https://..."
              hint="URL complète d'une image en ligne (JPEG ou PNG)."
              value={value('imageUrl')}
              error={errors?.imageUrl}
            />
            <div class="flex justify-end gap-(--space-3) pt-(--space-2) max-md:flex-col-reverse">
              <ButtonLink href="/manage/rooms/" variant="secondary">
                Annuler
              </ButtonLink>
              <Button type="submit" busy={action.isRunning}>
                Enregistrer
              </Button>
            </div>
          </Form>
          <aside
            aria-labelledby="preview-title"
            class="flex flex-col gap-(--space-2) lg:sticky lg:top-[calc(4rem+var(--space-4))]"
          >
            <h2 id="preview-title" class="text-(length:--font-size-sm) text-(--color-text-muted)">
              Aperçu dans le catalogue
            </h2>
            <div inert>
              <RoomCard room={preview.value} />
            </div>
          </aside>
        </div>
      </>
    );
  },
);
