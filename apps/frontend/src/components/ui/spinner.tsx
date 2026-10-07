import { component$ } from '@builder.io/qwik';

export const Spinner = component$(() => (
  <span
    aria-hidden="true"
    class="size-[1em] animate-spin rounded-(--radius-full) border-2 border-current border-r-transparent motion-reduce:[animation-duration:2.4s]"
  />
));
