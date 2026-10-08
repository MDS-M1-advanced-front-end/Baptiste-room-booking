import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, type DocumentHead } from "@builder.io/qwik-city";
import { postRooms } from "@room-booking/core";
import { RoomForm } from "~/components/room-form/room-form";
import { api } from "~/lib/api/client.server";
import { requireRole } from "~/lib/auth.server";
import { MANAGER_ROLES } from "~/lib/navigation";
import { roomError } from "~/lib/rooms";
import { roomShape } from "~/lib/schemas";

export const useCreateRoom = routeAction$(async (body, event) => {
  requireRole(event, MANAGER_ROLES);
  const { data, response } = await postRooms({ client: api(event), body });
  if (!data)
    return event.fail(response?.status ?? 500, {
      message: roomError(response?.status),
    });
  throw event.redirect(303, "/manage/rooms/");
}, zod$(roomShape));

export default component$(() => {
  const create = useCreateRoom();
  return <RoomForm title="Ajouter une salle" action={create} />;
});

export const head: DocumentHead = { title: "Ajouter une salle" };
