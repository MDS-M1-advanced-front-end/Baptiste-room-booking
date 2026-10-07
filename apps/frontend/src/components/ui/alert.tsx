import { component$, Slot } from '@builder.io/qwik';
import { Icon, type IconName } from './icon';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<AlertTone, { class: string; icon: IconName; role?: 'alert' | 'status' }> = {
  info: { class: 'bg-(--color-info-bg) text-(--color-info-text)', icon: 'info' },
  success: {
    class: 'bg-(--color-success-bg) text-(--color-success-text)',
    icon: 'ok',
    role: 'status',
  },
  warning: { class: 'bg-(--color-warning-bg) text-(--color-warning-text)', icon: 'alert' },
  danger: {
    class: 'bg-(--color-danger-bg) text-(--color-danger-text)',
    icon: 'alert',
    role: 'alert',
  },
};

export const Alert = component$<{ tone: AlertTone; title?: string; id?: string }>(
  ({ tone, title, id }) => (
    <div
      id={id}
      role={TONES[tone].role}
      tabIndex={id ? -1 : undefined}
      class={[
        'flex gap-(--space-3) rounded-(--radius-md) border border-l-4 border-current px-(--space-4) py-(--space-3)',
        TONES[tone].class,
      ]}
    >
      <Icon name={TONES[tone].icon} class="mt-0.5" />
      <div class="text-(--color-text)">
        {title && <p class="font-(--font-weight-bold) text-current">{title}</p>}
        <Slot />
      </div>
    </div>
  ),
);
