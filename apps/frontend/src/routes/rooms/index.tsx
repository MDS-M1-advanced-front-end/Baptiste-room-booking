import { component$ } from '@builder.io/qwik';
import { routeLoader$, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { getRooms } from '@room-booking/core';
import { RoomCard } from '~/components/room-card/room-card';
import { Alert } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button, ButtonLink } from '~/components/ui/button';
import { CARD, CARD_BODY } from '~/components/ui/card';
import { Checkbox, Field, Input, Select, TextField, fieldA11y } from '~/components/ui/field';
import { Icon } from '~/components/ui/icon';
import { EmptyState, PageHeader } from '~/components/ui/page-header';
import { Pagination } from '~/components/ui/pagination';
import { api } from '~/lib/api/client.server';
import { formatDay } from '~/lib/format';
import { LOCATIONS } from '~/lib/locations';
import { parseRoomsQuery, type RoomsQuery } from '~/lib/url-params';

const ROOMS = '/rooms/';

export const useRooms = routeLoader$(async (event) => {
  const query = parseRoomsQuery(event.url.searchParams);
  const { data } = await getRooms({ client: api(event), query });
  return { query, result: data ?? null };
});

const activeFilters = (query: RoomsQuery) =>
  Object.keys(query).filter((key) => key !== 'page' && key !== 'pageSize').length;

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;

const Filters = component$<{ query: RoomsQuery }>(({ query }) => {
  const active = activeFilters(query);
  return (
    <details class="group/filters lg:[&::details-content]:[content-visibility:visible]">
      <summary class="flex min-h-(--size-control) cursor-pointer list-none items-center justify-between rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) px-(--space-4) font-(--font-weight-semibold) lg:hidden [&::-webkit-details-marker]:hidden">
        <span class="inline-flex items-center gap-(--space-2)">
          <Icon name="sliders" />
          Filtres
          {active > 0 && <Badge tone="neutral">{plural(active, 'actif')}</Badge>}
        </span>
        <Icon name="down" class="transition-transform group-open/filters:rotate-180" />
      </summary>
      <form
        method="get"
        action={ROOMS}
        role="search"
        aria-label="Rechercher une salle"
        class={[CARD, 'mt-(--space-2) lg:mt-0']}
      >
        <div class={[CARD_BODY, 'flex flex-col gap-(--space-4)']}>
          <TextField
            id="search"
            label="Recherche"
            type="search"
            icon="search"
            placeholder="Nom ou description"
            value={query.search}
          />
          <Field id="location" label="Lieu">
            <Select {...fieldA11y({ id: 'location' })}>
              <option value="">Tous les lieux</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location} selected={location === query.location}>
                  {location}
                </option>
              ))}
            </Select>
          </Field>
          <fieldset>
            <legend class="mb-(--space-2) font-(--font-weight-semibold)">Capacité</legend>
            <div class="grid grid-cols-2 gap-(--space-3)">
              <Field id="capacityMin" label="Minimum" class="text-(length:--font-size-sm)">
                <Input
                  {...fieldA11y({ id: 'capacityMin' })}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={query.capacityMin}
                />
              </Field>
              <Field id="capacityMax" label="Maximum" class="text-(length:--font-size-sm)">
                <Input
                  {...fieldA11y({ id: 'capacityMax' })}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={query.capacityMax}
                />
              </Field>
            </div>
          </fieldset>
          <TextField id="date" label="Date" type="date" value={query.date} />
          <fieldset>
            <legend class="mb-(--space-2) font-(--font-weight-semibold)">Créneau</legend>
            <div class="grid grid-cols-2 gap-(--space-3)">
              <Field id="startTime" label="De" class="text-(length:--font-size-sm)">
                <Input
                  {...fieldA11y({ id: 'startTime' })}
                  type="time"
                  step={3600}
                  value={query.startTime}
                />
              </Field>
              <Field id="endTime" label="À" class="text-(length:--font-size-sm)">
                <Input
                  {...fieldA11y({ id: 'endTime' })}
                  type="time"
                  step={3600}
                  value={query.endTime}
                />
              </Field>
            </div>
          </fieldset>
          <Checkbox
            name="available"
            value="true"
            checked={query.available}
            label="Uniquement les salles disponibles"
          />
          <div class="flex flex-col gap-(--space-2)">
            <Button type="submit" block>
              Afficher les résultats
            </Button>
            <ButtonLink href={ROOMS} variant="ghost" block>
              Réinitialiser les filtres
            </ButtonLink>
          </div>
        </div>
      </form>
    </details>
  );
});

const Summary = component$<{ query: RoomsQuery; total: number }>(({ query, total }) => (
  <p role="status" class="mb-(--space-4)">
    <strong>{plural(total, 'salle')}</strong>
    {query.capacityMin && ` pour ${query.capacityMin} personnes ou plus`}
    {query.location && ` à ${query.location}`}
    {query.date && `, le ${formatDay(query.date)}`}
  </p>
));

export default component$(() => {
  const rooms = useRooms();
  const { url } = useLocation();
  const { query, result } = rooms.value;
  return (
    <>
      <PageHeader
        title="Trouver une salle"
        description="Des salles de réunion, de formation et d'événement, réservables à l'heure."
      />
      <div class="grid items-start gap-(--space-5) lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Filters query={query} />
        <section aria-labelledby="results-title">
          <h2 id="results-title" class="sr-only">
            Résultats
          </h2>
          {!result ? (
            <Alert tone="danger" title="Les salles n'ont pas pu être chargées">
              <p>Le serveur ne répond pas. Vérifiez votre connexion puis réessayez.</p>
              <ButtonLink
                href={url.pathname + url.search}
                variant="secondary"
                size="sm"
                class="mt-(--space-2)"
              >
                Réessayer
              </ButtonLink>
            </Alert>
          ) : result.items.length === 0 ? (
            <>
              <Summary query={query} total={0} />
              <EmptyState
                title="Aucune salle ne correspond"
                icon="search"
                description="Élargissez la capacité ou choisissez une autre date."
              >
                <ButtonLink href={ROOMS} variant="secondary">
                  Réinitialiser les filtres
                </ButtonLink>
              </EmptyState>
            </>
          ) : (
            <>
              <Summary query={query} total={result.total} />
              <ul class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-(--space-4)">
                {result.items.map((room, index) => (
                  <li key={room.id}>
                    <RoomCard room={room} priority={index === 0} />
                  </li>
                ))}
              </ul>
              <Pagination
                page={result.page}
                pageSize={result.pageSize}
                total={result.total}
                query={url.search}
                noun="Salles"
              />
            </>
          )}
        </section>
      </div>
    </>
  );
});

export const head: DocumentHead = { title: 'Trouver une salle' };
