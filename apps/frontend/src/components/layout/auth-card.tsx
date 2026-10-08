import { component$, Slot } from "@builder.io/qwik";
import { CARD } from "~/components/ui/card";

export const AuthCard = component$<{ title: string }>(({ title }) => (
  <div class="mx-auto flex max-w-(--size-container-narrow) flex-col gap-(--space-4) md:pt-(--space-6)">
    <div class={CARD}>
      <div class="flex flex-col gap-(--space-4) p-(--space-5) md:p-(--space-6)">
        <div class="flex flex-col gap-(--space-2)">
          <h1>{title}</h1>
          <Slot name="intro" />
        </div>
        <Slot />
      </div>
    </div>
    <p class="mt-(--space-4) text-center">
      <Slot name="switch" />
    </p>
  </div>
));
