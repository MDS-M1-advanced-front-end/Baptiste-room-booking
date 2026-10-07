import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { Reservation } from "@room-booking/core";
import { StatusBadge } from "~/components/ui/badge";
import { Meta, MetaItem } from "~/components/ui/page-header";
import { slotLabel } from "~/lib/bookings";
import { formatAmount, formatParis } from "~/lib/format";

export const ReservationItem = component$<{
  reservation: Reservation;
  roomName?: string;
  past?: boolean;
}>(({ reservation, roomName, past }) => (
  <li
    class={[
      "grid gap-(--space-3) rounded-(--radius-lg) border border-(--color-border) p-(--space-4) md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-center md:px-(--space-5)",
      past ? "bg-(--color-bg)" : "bg-(--color-surface)",
    ]}
  >
    <p
      aria-hidden="true"
      class="flex items-baseline gap-(--space-2) text-(--color-action) md:flex-col md:items-center md:gap-0 md:rounded-(--radius-md) md:bg-(--color-action-subtle) md:p-(--space-2)"
    >
      <span class="text-(length:--font-size-xl) leading-none font-(--font-weight-bold)">
        {formatParis(reservation.startAt, "day")}
      </span>
      <span class="text-(length:--font-size-sm) font-(--font-weight-semibold) uppercase">
        {formatParis(reservation.startAt, "month")}
      </span>
    </p>
    <div class="flex flex-col gap-(--space-1)">
      <div class="flex flex-wrap items-center gap-(--space-2)">
        <h3>
          <Link href={`/rooms/${reservation.roomId}/`}>
            {roomName ?? "Salle"}
          </Link>
        </h3>
        <StatusBadge status={reservation.status} />
      </div>
      <Meta>
        <MetaItem icon="calendar">{slotLabel(reservation)}</MetaItem>
        {reservation.numberOfParticipants && (
          <MetaItem icon="users">
            {reservation.numberOfParticipants} participants
          </MetaItem>
        )}
        <MetaItem icon="euro">{formatAmount(reservation.totalAmount)}</MetaItem>
      </Meta>
      <Slot />
      {reservation.comment && (
        <p class="text-(length:--font-size-sm) text-(--color-text-muted)">
          « {reservation.comment} »
        </p>
      )}
    </div>
    <div class="flex flex-wrap gap-(--space-2) empty:hidden">
      <Slot name="actions" />
    </div>
  </li>
));

export const ReservationList = component$(() => (
  <ul class="flex flex-col gap-(--space-3)">
    <Slot />
  </ul>
));
