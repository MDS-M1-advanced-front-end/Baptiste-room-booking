import { component$ } from "@builder.io/qwik";
import type { User } from "@room-booking/core";

export const initials = (user: Pick<User, "firstName" | "lastName">) =>
  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

export const Avatar = component$<{
  user: Pick<User, "firstName" | "lastName">;
}>(({ user }) => (
  <span
    aria-hidden="true"
    class="inline-grid size-8 place-items-center rounded-(--radius-full) bg-(--color-action) text-(length:--font-size-xs) font-(--font-weight-bold) text-(--color-on-action)"
  >
    {initials(user)}
  </span>
));
