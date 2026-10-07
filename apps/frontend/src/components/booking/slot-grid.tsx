import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { AvailabilitySlot } from '@room-booking/core';
import { buttonClass } from '~/components/ui/button';
import { controlClass } from '~/components/ui/field';
import { Icon } from '~/components/ui/icon';
import { addDays } from '~/lib/dates';
import { formatDay, formatTime } from '~/lib/format';

const navClass = buttonClass({ variant: 'secondary', size: 'icon' });

export const DayNav = component$<{ day: string; min: string }>(({ day, min }) => (
  <form method="get" class="flex flex-col gap-(--space-1)">
    <label for="slot-date" class="font-(--font-weight-semibold)">
      Date
    </label>
    <div class="flex items-center gap-(--space-2)">
      {day > min ? (
        <Link href={`?date=${addDays(day, -1)}`} class={navClass}>
          <Icon name="left" />
          <span class="sr-only">Jour précédent</span>
        </Link>
      ) : (
        <span aria-disabled="true" class={navClass}>
          <Icon name="left" />
          <span class="sr-only">Jour précédent</span>
        </span>
      )}
      <input
        id="slot-date"
        name="date"
        type="date"
        min={min}
        value={day}
        required
        class={[controlClass, 'flex-1']}
        onChange$={(_, input) => input.form?.requestSubmit()}
      />
      <Link href={`?date=${addDays(day, 1)}`} class={navClass}>
        <Icon name="right" />
        <span class="sr-only">Jour suivant</span>
      </Link>
    </div>
  </form>
));

export const slotClass = [
  'flex min-h-(--size-control) cursor-pointer flex-col items-center justify-center rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) px-(--space-2) py-(--space-1) font-(--font-weight-semibold) text-(--color-text) tabular-nums',
  'hover:border-(--color-action) hover:bg-(--color-action-subtle)',
  'aria-pressed:border-(--color-action) aria-pressed:bg-(--color-action) aria-pressed:text-(--color-on-action) aria-pressed:[&_small]:text-(--color-on-action)',
  'aria-disabled:cursor-not-allowed aria-disabled:border-dashed aria-disabled:border-(--color-border) aria-disabled:bg-(--color-surface-muted) aria-disabled:text-(--color-text-muted) aria-disabled:line-through',
];

export const SlotLabel = component$<{ slot: AvailabilitySlot }>(({ slot }) => (
  <>
    {formatTime(slot.startTime)}
    <small class="text-(length:--font-size-xs) font-(--font-weight-regular) text-(--color-text-muted)">
      {slot.available ? `à ${formatTime(slot.endTime)}` : 'Réservé'}
    </small>
  </>
));

export const SlotsHeading = component$<{ day: string; id: string }>(({ day, id }) => (
  <p id={id} class="font-(--font-weight-semibold)">
    Créneaux du {formatDay(day)}
  </p>
));

export const SLOT_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-(--space-2)';
