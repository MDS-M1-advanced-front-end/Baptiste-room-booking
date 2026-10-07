import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireUser } from "~/lib/auth.server";

export const onRequest: RequestHandler = (event) => {
  requireUser(event);
};

export default component$(() => <Slot />);
