import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { Room } from '@room-booking/core';
import { Image } from 'qwik-image';
import { Badge } from '~/components/ui/badge';
import { CARD } from '~/components/ui/card';
import { ChipList } from '~/components/ui/chip-list';
import { Icon } from '~/components/ui/icon';
import { Meta, MetaItem } from '~/components/ui/page-header';
import { formatRate } from '~/lib/format';

const PHOTO_FRAMES = {
  card: 'aspect-video w-full',
  hero: 'aspect-video w-full rounded-(--radius-lg) lg:aspect-[21/9]',
  thumb: 'h-9 w-12 flex-none rounded-(--radius-sm)',
};

export const RoomPhoto = component$<{
  room: Room;
  variant?: keyof typeof PHOTO_FRAMES;
  priority?: boolean;
}>(({ room, variant = 'card', priority = false }) => {
  const frame = [PHOTO_FRAMES[variant], room.status === 'INACTIVE' && 'grayscale'];
  const hero = variant === 'hero';
  return room.imageUrl ? (
    <Image
      src={room.imageUrl}
      alt=""
      layout={variant === 'thumb' ? 'fixed' : 'fullWidth'}
      width={variant === 'thumb' ? 48 : undefined}
      height={variant === 'thumb' ? 36 : undefined}
      objectFit="cover"
      placeholder="var(--color-action-subtle)"
      loading={hero || priority ? 'eager' : 'lazy'}
      fetchpriority={hero || priority ? 'high' : undefined}
      sizes={variant === 'thumb' ? '48px' : '(min-width: 64rem) 30vw, calc(100vw - 2rem)'}
      class={['block', frame]}
    />
  ) : (
    <div
      aria-hidden="true"
      class={['grid place-items-center bg-(--color-action-subtle) text-(--color-action)', frame]}
    >
      <Icon
        name="building"
        class={[
          'rounded-(--radius-full) bg-(--color-surface) stroke-[1.5]',
          variant === 'thumb' ? 'size-6 p-(--space-1)' : 'size-10 p-(--space-2)',
        ]}
      />
    </div>
  );
});

export const RoomCard = component$<{ room: Room; priority?: boolean }>(({ room, priority }) => (
  <article
    class={[
      CARD,
      'relative flex h-full flex-col overflow-hidden transition-shadow duration-(--duration-fast) ease-(--easing-standard) outline-offset-(--focus-ring-offset) outline-(--color-focus) hover:shadow-(--shadow-md) has-[a:focus-visible]:outline-(length:--focus-ring-width) has-[a:focus-visible]:outline-solid',
    ]}
  >
    <RoomPhoto room={room} priority={priority} />
    <div class="flex flex-1 flex-col gap-(--space-2) p-(--space-4)">
      <h3 class="text-(length:--font-size-lg) leading-(--line-height-tight) font-(--font-weight-bold)">
        <Link
          href={`/rooms/${room.id}/`}
          class="text-(--color-text) no-underline after:absolute after:inset-0 focus-visible:outline-none"
        >
          {room.name}
        </Link>
      </h3>
      <Meta>
        <MetaItem icon="pin">{room.location}</MetaItem>
        <MetaItem icon="users">{room.capacity} pers. max</MetaItem>
      </Meta>
      <ChipList items={room.equipment} />
      <div class="mt-auto flex items-baseline justify-between pt-(--space-2)">
        {room.status === 'INACTIVE' && <Badge tone="neutral">Inactive</Badge>}
        <p class="ml-auto text-(length:--font-size-lg) font-(--font-weight-bold)">
          {formatRate(room.pricePerHour)}{' '}
          <small class="text-(length:--font-size-sm) font-(--font-weight-regular) text-(--color-text-muted)">
            / heure
          </small>
        </p>
      </div>
    </div>
  </article>
));
