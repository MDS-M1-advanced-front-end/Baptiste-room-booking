import { component$, Slot } from '@builder.io/qwik';
import type { ReservationStatus, UserRole } from '@room-booking/core';

export type BadgeTone =
  'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  pending:
    'bg-(--color-status-pending-bg) text-(--color-status-pending-text) before:border-2 before:border-current before:bg-transparent',
  confirmed: 'bg-(--color-status-confirmed-bg) text-(--color-status-confirmed-text)',
  rejected:
    'bg-(--color-status-rejected-bg) text-(--color-status-rejected-text) before:rotate-45 before:rounded-[1px]',
  cancelled:
    'bg-(--color-status-cancelled-bg) text-(--color-status-cancelled-text) before:rotate-45 before:rounded-[1px]',
  completed: 'bg-(--color-status-completed-bg) text-(--color-status-completed-text)',
  neutral: 'bg-(--color-surface-muted) text-(--color-status-cancelled-text)',
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'Client',
  GESTIONNAIRE: 'Gestionnaire',
  ADMINISTRATEUR: 'Administrateur',
};

const STATUS_TONES: Record<ReservationStatus, BadgeTone> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const Badge = component$<{ tone: BadgeTone }>(({ tone }) => (
  <span
    class={[
      'inline-flex items-center gap-(--space-1) rounded-(--radius-full) px-(--space-2) py-0.5 text-(length:--font-size-xs) leading-(--line-height-base) font-(--font-weight-bold) whitespace-nowrap',
      'before:size-2 before:rounded-(--radius-full) before:bg-current before:content-[""]',
      TONES[tone] ?? TONES.neutral,
    ]}
  >
    <Slot />
  </span>
));

export const StatusBadge = component$<{ status: ReservationStatus }>(({ status }) => (
  <Badge tone={STATUS_TONES[status] ?? 'neutral'}>
    {RESERVATION_STATUS_LABELS[status] ?? status}
  </Badge>
));

export const Count = component$<{ value: number; label?: string }>(({ value, label }) => (
  <span class="inline-grid h-[1.375rem] min-w-[1.375rem] place-items-center rounded-(--radius-full) bg-(--color-accent) px-(--space-1) text-(length:--font-size-xs) font-(--font-weight-bold) text-(--color-on-accent)">
    {value}
    {label && <span class="sr-only"> {label}</span>}
  </span>
));
