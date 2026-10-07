import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export interface SegmentedItem {
  label: string;
  href: string;
  current: boolean;
}

export const Segmented = component$<{ items: SegmentedItem[]; label: string }>(
  ({ items, label }) => (
    <nav aria-label={label}>
      <ul class="mb-(--space-4) flex gap-(--space-1) overflow-x-auto rounded-(--radius-md) bg-(--color-surface-muted) p-(--space-1)">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              class="inline-flex min-h-(--size-control-sm) items-center gap-(--space-2) rounded-(--radius-sm) px-(--space-3) text-(length:--font-size-sm) font-(--font-weight-semibold) whitespace-nowrap text-(--color-text) no-underline aria-[current=page]:bg-(--color-surface) aria-[current=page]:text-(--color-action) aria-[current=page]:shadow-(--shadow-sm)"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  ),
);
