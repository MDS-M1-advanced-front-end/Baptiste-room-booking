import { component$, Slot } from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { getCurrentUser, listReservations } from "@room-booking/core";
import {
  CONTAINER,
  SiteFooter,
  SiteHeader,
} from "~/components/layout/site-header";
import { api } from "~/lib/api/client.server";
import { HOME, USER_KEY, currentUser } from "~/lib/auth.server";
import { isManager } from "~/lib/navigation";
import { clearToken, readToken } from "~/lib/session.server";

// Minimal CSP: Qwik inlines its loader script, so no script-src here.
const CSP =
  "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'";

export const onRequest: RequestHandler = async (event) => {
  event.headers.set("Content-Security-Policy", CSP);
  event.headers.set("X-Frame-Options", "DENY");
  event.headers.set("X-Content-Type-Options", "nosniff");
  event.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (!import.meta.env.DEV)
    event.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  event.cacheControl({ noCache: true, private: true });
  if (!readToken(event.cookie)) return;
  const { data } = await getCurrentUser({ client: api(event) });
  if (data) event.sharedMap.set(USER_KEY, data);
  else clearToken(event.cookie);
};

export const useCurrentUser = routeLoader$(
  (event) => currentUser(event) ?? null,
);

export const usePendingCount = routeLoader$(async (event) => {
  if (!isManager(currentUser(event))) return 0;
  const { data } = await listReservations({
    client: api(event),
    query: { status: "PENDING_PAYMENT", pageSize: 1 },
  });
  return data?.total ?? 0;
});

export const useLogout = routeAction$((_, event) => {
  clearToken(event.cookie);
  throw event.redirect(303, HOME);
});

export default component$(() => {
  const user = useCurrentUser();
  const pendingCount = usePendingCount();
  const logout = useLogout();
  return (
    <>
      <a
        href="#main"
        class="absolute top-(--space-2) left-(--space-2) z-[calc(var(--z-header)+1)] -translate-y-[200%] rounded-(--radius-md) bg-(--color-surface) px-(--space-4) py-(--space-2) focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <SiteHeader
        user={user.value}
        pendingCount={pendingCount.value}
        logout={logout}
      />
      <main id="main" class={[CONTAINER, "pt-(--space-5) pb-(--space-10)"]}>
        <Slot />
      </main>
      <SiteFooter />
    </>
  );
});
