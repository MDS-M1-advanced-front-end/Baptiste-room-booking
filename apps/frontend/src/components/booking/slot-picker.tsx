import { component$, useId, type Signal } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { AvailabilitySlot } from '@room-booking/core';
import { buttonClass } from '~/components/ui/button';
import { controlClass } from '~/components/ui/field';
import { Icon } from '~/components/ui/icon';
import { addDays } from '~/lib/dates';
import { formatDay, formatHours, formatTime } from '~/lib/format';
import { rangeMinutes, selectSlot, type SlotRange } from '~/lib/slots';

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

const slotClass = [
  'flex min-h-(--size-control) cursor-pointer flex-col items-center justify-center rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) px-(--space-2) py-(--space-1) font-(--font-weight-semibold) text-(--color-text) tabular-nums',
  'hover:border-(--color-action) hover:bg-(--color-action-subtle)',
  'aria-pressed:border-(--color-action) aria-pressed:bg-(--color-action) aria-pressed:text-(--color-on-action) aria-pressed:[&_small]:text-(--color-on-action)',
  'aria-disabled:cursor-not-allowed aria-disabled:border-dashed aria-disabled:border-(--color-border) aria-disabled:bg-(--color-surface-muted) aria-disabled:text-(--color-text-muted) aria-disabled:line-through',
];

const swatchClass = 'size-4 rounded-(--radius-sm) border';

export const selectionLabel = (slots: AvailabilitySlot[], range: SlotRange | null) =>
  range
    ? `Sélection : de ${formatTime(slots[range.start].startTime)} à ${formatTime(slots[range.end].endTime)} (${formatHours(rangeMinutes(slots, range))})`
    : 'Aucun créneau sélectionné.';

export const SlotPicker = component$<{
  day: string;
  slots: AvailabilitySlot[];
  selection: Signal<SlotRange | null>;
}>(({ day, slots, selection }) => {
  const labelId = useId();
  if (slots.length === 0) {
    return <p class="text-(--color-text-muted)">Aucun créneau ouvert ce jour.</p>;
  }
  return (
    <div class="flex flex-col gap-(--space-4)">
      <div class="flex flex-col gap-(--space-2)">
        <p id={labelId} class="font-(--font-weight-semibold)">
          Créneaux du {formatDay(day)}
        </p>
        <div
          role="group"
          aria-labelledby={labelId}
          class="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-(--space-2)"
          onKeyDown$={(event, group) => {
            const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
            if (!step) return;
            const buttons = Array.from(group.querySelectorAll('button'));
            buttons[buttons.indexOf(document.activeElement as HTMLButtonElement) + step]?.focus();
          }}
        >
          {slots.map((slot, index) => {
            const selected =
              !!selection.value && index >= selection.value.start && index <= selection.value.end;
            return (
              <button
                key={slot.startTime}
                type="button"
                class={slotClass}
                aria-disabled={slot.available ? undefined : 'true'}
                aria-pressed={slot.available ? selected : undefined}
                onClick$={() => (selection.value = selectSlot(slots, selection.value, index))}
              >
                {formatTime(slot.startTime)}
                <small class="text-(length:--font-size-xs) font-(--font-weight-regular) text-(--color-text-muted)">
                  {slot.available ? `à ${formatTime(slot.endTime)}` : 'Réservé'}
                </small>
              </button>
            );
          })}
        </div>
        <p role="status" class="text-(length:--font-size-sm) font-(--font-weight-bold)">
          {selectionLabel(slots, selection.value)}
        </p>
      </div>
      <ul
        aria-hidden="true"
        class="flex flex-wrap gap-x-(--space-4) gap-y-(--space-2) text-(length:--font-size-sm) text-(--color-text-muted)"
      >
        <li class="inline-flex items-center gap-(--space-2)">
          <span class={[swatchClass, 'border-(--color-border-strong) bg-(--color-surface)']} />
          Libre
        </li>
        <li class="inline-flex items-center gap-(--space-2)">
          <span class={[swatchClass, 'border-(--color-action) bg-(--color-action)']} />
          Sélectionné
        </li>
        <li class="inline-flex items-center gap-(--space-2)">
          <span
            class={[
              swatchClass,
              'border-dashed border-(--color-border-strong) bg-(--color-surface-muted)',
            ]}
          />
          Indisponible
        </li>
      </ul>
    </div>
  );
});
