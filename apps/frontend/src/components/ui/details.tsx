import { component$, Slot } from "@builder.io/qwik";

export const Details = component$(() => (
  <dl class="grid gap-(--space-3) md:grid-cols-[12rem_1fr] lg:grid-cols-1">
    <Slot />
  </dl>
));

export const Detail = component$<{ term: string }>(({ term }) => (
  <>
    <dt class="text-(--color-text-muted)">{term}</dt>
    <dd class="font-(--font-weight-semibold)">
      <Slot />
    </dd>
  </>
));
