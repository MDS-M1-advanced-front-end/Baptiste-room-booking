import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

// ponytail: local copy of the API Room shape, swap for the packages/core
// type once `pnpm core:sync` fills it.
export interface RoomProps {
  id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  pricePerHour: number;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string | null;
}

const price = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const iconClass =
  'size-[1.25em] flex-none fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]';

export const RoomCard = component$<{ room: RoomProps }>(({ room }) => {
  const inactive = room.status === 'INACTIVE';

  return (
    <article class="relative flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) transition-shadow duration-(--duration-fast) ease-(--easing-standard) outline-offset-(--focus-ring-offset) outline-(--color-focus) hover:shadow-(--shadow-md) has-[a:focus-visible]:outline-(length:--focus-ring-width) has-[a:focus-visible]:outline-solid">
      {room.imageUrl ? (
        <img
          src={room.imageUrl}
          alt=""
          width={800}
          height={450}
          loading="lazy"
          class={['aspect-video w-full object-cover', inactive && 'grayscale']}
        />
      ) : (
        <div
          aria-hidden="true"
          class={[
            'grid aspect-video place-items-center bg-(--color-action-subtle) text-(--color-action)',
            inactive && 'grayscale',
          ]}
        >
          <svg
            viewBox="0 0 24 24"
            class={`${iconClass} size-10 rounded-(--radius-full) bg-(--color-surface) p-(--space-2) stroke-[1.5]`}
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
          </svg>
        </div>
      )}

      <div class="flex flex-1 flex-col gap-(--space-2) p-(--space-4)">
        <h3 class="text-(length:--font-size-lg) leading-(--line-height-tight) font-(--font-weight-bold)">
          {/* ::after stretches the link: whole card clickable, one link announced */}
          <Link
            href={`/rooms/${room.id}`}
            class="text-(--color-text) no-underline after:absolute after:inset-0 focus-visible:outline-none"
          >
            {room.name}
          </Link>
        </h3>

        <p class="flex flex-wrap gap-x-(--space-4) gap-y-(--space-1) text-(length:--font-size-sm) text-(--color-text-muted)">
          <span class="inline-flex items-center gap-(--space-1)">
            <svg viewBox="0 0 24 24" aria-hidden="true" class={iconClass}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {room.location}
          </span>
          <span class="inline-flex items-center gap-(--space-1)">
            <svg viewBox="0 0 24 24" aria-hidden="true" class={iconClass}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {room.capacity} pers. max
          </span>
        </p>

        {room.equipment.length > 0 && (
          <ul class="flex flex-wrap gap-(--space-1)">
            {room.equipment.map((item) => (
              <li
                key={item}
                class="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg) px-(--space-2) py-0.5 text-(length:--font-size-xs) text-(--color-text-muted)"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        <div class="mt-auto flex items-baseline justify-between pt-(--space-2)">
          {inactive && (
            <span class="inline-flex items-center gap-(--space-1) rounded-(--radius-full) bg-(--color-surface-muted) px-(--space-2) py-0.5 text-(length:--font-size-xs) font-(--font-weight-bold) whitespace-nowrap text-(--color-status-cancelled-text) before:size-2 before:rounded-(--radius-full) before:bg-current">
              Inactive
            </span>
          )}
          <p class="ml-auto text-(length:--font-size-lg) font-(--font-weight-bold)">
            {price.format(room.pricePerHour)}{' '}
            <small class="text-(length:--font-size-sm) font-(--font-weight-regular) text-(--color-text-muted)">
              / heure
            </small>
          </p>
        </div>
      </div>
    </article>
  );
});
