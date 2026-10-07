import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireRole } from "~/lib/auth.server";
import { MANAGER_ROLES } from "~/lib/navigation";

export const onRequest: RequestHandler = (event) => {
  requireRole(event, MANAGER_ROLES);
};

export default component$(() => <Slot />);
