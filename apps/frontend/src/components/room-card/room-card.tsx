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

export const RoomPhoto = component$<{ room: Room; priority?: boolean; class?: string }>(
  ({ room, priority, class: className }) => {
    const tone = [room.status === 'INACTIVE' && 'grayscale', className];
    return room.imageUrl ? (
      <Image
        src={room.imageUrl}
        alt=""
        layout="fullWidth"
        aspectRatio={16 / 9}
        placeholder="var(--color-action-subtle)"
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        class={['block', tone]}
      />
    ) : (
      <div
        aria-hidden="true"
        class={[
          'grid aspect-video place-items-center bg-(--color-action-subtle) text-(--color-action)',
          tone,
        ]}
      >
        <Icon
          name="building"
          class="size-10 rounded-(--radius-full) bg-(--color-surface) p-(--space-2) stroke-[1.5]"
        />
      </div>
    );
  },
);

export const RoomCard = component$<{ room: Room }>(({ room }) => (
  <article
    class={[
      CARD,
      'relative flex h-full flex-col overflow-hidden transition-shadow duration-(--duration-fast) ease-(--easing-standard) outline-offset-(--focus-ring-offset) outline-(--color-focus) hover:shadow-(--shadow-md) has-[a:focus-visible]:outline-(length:--focus-ring-width) has-[a:focus-visible]:outline-solid',
    ]}
  >
    <RoomPhoto room={room} />
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
