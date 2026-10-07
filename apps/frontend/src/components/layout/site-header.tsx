import { component$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  useLocation,
  type ActionStore,
} from "@builder.io/qwik-city";
import type { User } from "@room-booking/core";
import { Avatar } from "~/components/ui/avatar";
import { Count } from "~/components/ui/badge";
import { Button, ButtonLink } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { isCurrent, navItems } from "~/lib/navigation";

export const CONTAINER =
  "mx-auto w-full max-w-(--size-container) px-(--space-4) md:px-(--space-6)";

const navLinkClass =
  "inline-flex min-h-(--size-control) items-center gap-(--space-2) rounded-(--radius-md) px-(--space-3) font-(--font-weight-semibold) text-(--color-text) no-underline hover:bg-(--color-action-subtle) hover:text-(--color-action) aria-[current=page]:bg-(--color-action-subtle) aria-[current=page]:text-(--color-action)";

interface NavProps {
  user: User | null;
  pendingCount: number;
  logout: ActionStore<unknown, Record<string, unknown>, true>;
  vertical?: boolean;
}

const NavList = component$<NavProps>(
  ({ user, pendingCount, logout, vertical }) => {
    const { url } = useLocation();
    return (
      <ul
        class={[
          "flex gap-(--space-1)",
          vertical ? "flex-col items-stretch" : "items-center",
        ]}
      >
        {navItems(user, pendingCount).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              class={navLinkClass}
              aria-current={
                isCurrent(url.pathname, item.href) ? "page" : undefined
              }
            >
              {item.label}
              {item.count ? (
                <Count
                  value={item.count}
                  label={`(${item.count} en attente)`}
                />
              ) : null}
            </Link>
          </li>
        ))}
        <li
          aria-hidden="true"
          class={[
            "bg-(--color-border)",
            vertical ? "my-(--space-2) h-px" : "mx-(--space-2) h-6 w-px",
          ]}
        />
        {user ? (
          <>
            <li>
              <Link
                href="/account/"
                class={navLinkClass}
                aria-current={
                  url.pathname.startsWith("/account/") ? "page" : undefined
                }
              >
                <Avatar user={user} />
                {user.firstName} {user.lastName}
              </Link>
            </li>
            <li>
              <Form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  block={vertical}
                >
                  <Icon name="logout" />
                  Se déconnecter
                </Button>
              </Form>
            </li>
          </>
        ) : (
          <>
            <li>
              <ButtonLink
                href="/login/"
                variant="secondary"
                size="sm"
                block={vertical}
              >
                Se connecter
              </ButtonLink>
            </li>
            <li>
              <ButtonLink href="/register/" size="sm" block={vertical}>
                Créer un compte
              </ButtonLink>
            </li>
          </>
        )}
      </ul>
    );
  },
);

export const SiteHeader = component$<NavProps>((props) => (
  <header class="sticky top-0 z-(--z-header) border-b border-(--color-border) bg-(--color-surface)">
    <div
      class={[
        CONTAINER,
        "flex min-h-16 items-center justify-between gap-(--space-4)",
      ]}
    >
      <Link
        href="/rooms/"
        class="inline-flex items-center gap-(--space-2) text-(length:--font-size-lg) font-(--font-weight-bold) text-(--color-text) no-underline hover:text-(--color-text)"
      >
        <svg class="size-8" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="var(--color-action)" />
          <circle
            cx="15"
            cy="15"
            r="7"
            fill="none"
            stroke="var(--color-on-action)"
            stroke-width="3"
          />
          <path
            d="m19.5 19.5 5 5"
            stroke="var(--color-accent)"
            stroke-width="3.5"
            stroke-linecap="round"
          />
        </svg>
        Quorum
      </Link>
      <nav aria-label="Navigation principale" class="hidden lg:block">
        <NavList {...props} />
      </nav>
      <details class="group relative lg:hidden">
        <summary class="grid size-(--size-control) cursor-pointer list-none place-items-center rounded-(--radius-md) group-open:bg-(--color-action-subtle) group-open:text-(--color-action) hover:bg-(--color-action-subtle) [&::-webkit-details-marker]:hidden">
          <Icon name="menu" />
          <span class="sr-only">Menu</span>
        </summary>
        <nav
          aria-label="Menu principal"
          class="absolute top-[calc(100%+var(--space-2))] right-0 w-[min(18rem,calc(100vw-2*var(--space-4)))] rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--space-2) shadow-(--shadow-lg)"
        >
          <NavList {...props} vertical />
        </nav>
      </details>
    </div>
  </header>
));

export const SiteFooter = component$(() => (
  <footer class="border-t border-(--color-border) py-(--space-6) text-(length:--font-size-sm) text-(--color-text-muted)">
    <div
      class={[
        CONTAINER,
        "flex flex-wrap items-center justify-between gap-(--space-2)",
      ]}
    >
      <p>© 2026 Quorum · Maquette pédagogique du module M1 DFS</p>
      <ul class="flex flex-wrap items-center gap-(--space-2)">
        <li>
          <a href="#main">Accessibilité : partiellement conforme</a>
        </li>
        <li>
          <a href="#main">Mentions légales</a>
        </li>
      </ul>
    </div>
  </footer>
));
