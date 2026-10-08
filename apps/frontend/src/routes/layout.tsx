import { component$, Slot } from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { getAuthMe, getReservations } from "@room-booking/core";
import {
  CONTAINER,
  SiteFooter,
  SiteHeader,
} from "~/components/layout/site-header";
import { api } from "~/lib/api/client.server";
import { HOME, USER_KEY, currentUser } from "~/lib/auth.server";
import { isManager } from "~/lib/navigation";
import { clearToken, readToken } from "~/lib/session.server";

export const onRequest: RequestHandler = async (event) => {
  event.cacheControl({ noCache: true, private: true });
  if (!readToken(event.cookie)) return;
  const { data } = await getAuthMe({ client: api(event) });
  if (data) event.sharedMap.set(USER_KEY, data);
  else clearToken(event.cookie);
};

export const useCurrentUser = routeLoader$(
  (event) => currentUser(event) ?? null,
);

export const usePendingCount = routeLoader$(async (event) => {
  if (!isManager(currentUser(event))) return 0;
  const { data } = await getReservations({
    client: api(event),
    query: { status: "PENDING", pageSize: 1 },
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
