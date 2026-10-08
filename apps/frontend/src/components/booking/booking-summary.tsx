import { component$, type Signal } from "@builder.io/qwik";
import type { AvailabilitySlot } from "@room-booking/core";
import {
  formatAmount,
  formatDuration,
  formatShortDay,
  formatTime,
} from "~/lib/format";
import { estimatePrice, rangeMinutes, type SlotRange } from "~/lib/slots";

const totalClass = "border-t border-(--color-border) pt-(--space-3)";

export const BookingSummary = component$<{
  day: string;
  slots: AvailabilitySlot[];
  selection: Signal<SlotRange | null>;
  pricePerHour: number;
  before?: string;
}>(({ day, slots, selection, pricePerHour, before }) => {
  const range = selection.value;
  const minutes = range ? rangeMinutes(slots, range) : 0;
  const hours = range
    ? `${formatTime(slots[range.start].startTime)} – ${formatTime(slots[range.end].endTime)}`
    : "–";
  const rows: [string, string][] = [
    ...((before
      ? [
          ["Avant", before],
          ["Après", range ? `${formatShortDay(day)} · ${hours}` : "–"],
        ]
      : [
          ["Date", formatShortDay(day)],
          ["Horaire", hours],
        ]) as [string, string][]),
    [
      "Durée",
      range
        ? `${formatDuration(minutes)} × ${formatAmount(pricePerHour)}`
        : "–",
    ],
  ];
  return (
    <dl class="grid grid-cols-[auto_1fr] gap-y-(--space-2)">
      {rows.map(([term, value]) => (
        <>
          <dt
            key={`${term}-t`}
            class="pr-(--space-4) text-(--color-text-muted)"
          >
            {term}
          </dt>
          <dd
            key={`${term}-d`}
            class="text-right font-(--font-weight-semibold) tabular-nums"
          >
            {value}
          </dd>
        </>
      ))}
      <dt class={[totalClass, "pr-(--space-4) text-(--color-text-muted)"]}>
        {before ? "Nouveau prix estimé" : "Prix estimé"}
      </dt>
      <dd
        class={[
          totalClass,
          "text-right text-(length:--font-size-lg) font-(--font-weight-semibold) tabular-nums",
        ]}
      >
        {formatAmount(estimatePrice(pricePerHour, minutes))}
      </dd>
    </dl>
  );
});
