import { component$ } from '@builder.io/qwik';

export const ChipList = component$<{ items?: string[]; label?: string }>(({ items, label }) =>
  items?.length ? (
    <ul aria-label={label} class="flex flex-wrap gap-(--space-1)">
      {items.map((item) => (
        <li
          key={item}
          class="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg) px-(--space-2) py-0.5 text-(length:--font-size-xs) text-(--color-text-muted)"
        >
          {item}
        </li>
      ))}
    </ul>
  ) : null,
);
