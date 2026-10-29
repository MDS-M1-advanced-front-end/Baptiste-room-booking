import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Icon, type IconName } from "./icon";

export const PageHeader = component$<{ title: string; description?: string }>(
  ({ title, description }) => (
    <div class="mb-(--space-5) flex flex-wrap items-end justify-between gap-(--space-4)">
      <div>
        <h1>
          {title}
          <Slot name="title" />
        </h1>
        {description && (
          <p class="mt-(--space-1) text-(--color-text-muted)">{description}</p>
        )}
      </div>
      <Slot />
    </div>
  ),
);

export const BackLink = component$<{ href: string; label: string }>(
  ({ href, label }) => (
    <Link
      href={href}
      class="mb-(--space-3) inline-flex min-h-(--size-target-min) items-center gap-(--space-1) text-(length:--font-size-sm)"
    >
      <Icon name="left" />
      {label}
    </Link>
  ),
);

export const EmptyState = component$<{
  title: string;
  icon: IconName;
  description?: string;
}>(({ title, icon, description }) => (
  <div class="flex flex-col items-center gap-(--space-3) rounded-(--radius-lg) border border-dashed border-(--color-border-strong) bg-(--color-surface) px-(--space-4) py-(--space-8) text-center">
    <Icon name={icon} class="size-12 stroke-[1.5] text-(--color-text-muted)" />
    <h3>{title}</h3>
    {description && (
      <p class="max-w-md text-(--color-text-muted)">{description}</p>
    )}
    <Slot />
  </div>
));

export const Meta = component$(() => (
  <p class="flex flex-wrap gap-x-(--space-4) gap-y-(--space-1) text-(length:--font-size-sm) text-(--color-text-muted)">
    <Slot />
  </p>
));

export const MetaItem = component$<{ icon: IconName }>(({ icon }) => (
  <span class="inline-flex items-center gap-(--space-1)">
    <Icon name={icon} />
    <Slot />
  </span>
));
