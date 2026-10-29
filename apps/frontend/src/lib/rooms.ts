import type { Room, User } from "@room-booking/core";

export const canManage = (
  room: Pick<Room, "ownerId">,
  user: Pick<User, "id" | "role">,
) =>
  user.role === "ADMINISTRATEUR" ||
  (user.role === "GESTIONNAIRE" && room.ownerId === user.id);

export const ownedRooms = (rooms: Room[], user: Pick<User, "id" | "role">) =>
  rooms.filter((room) => canManage(room, user));

export const ROOM_EQUIPMENT = [
  'Écran 65"',
  "Tableau blanc",
  "Wi-Fi",
  "Vidéoprojecteur",
  "Paperboard",
  "Caméra visio",
  "Sonorisation",
  "Micros sans fil",
  "Postes informatiques",
  "Cuisine",
];

const field = (data: FormData, name: string) =>
  data.get(name)?.toString().trim() ?? "";

export const roomPreview = (data: FormData, room?: Room): Room => ({
  id: room?.id ?? "",
  status: room?.status ?? "ACTIVE",
  name: field(data, "name") || "Nouvelle salle",
  location: field(data, "location"),
  description: field(data, "description"),
  capacity: Number(field(data, "capacity")) || 0,
  pricePerHour: Number(field(data, "pricePerHour")) || 0,
  equipment: data.getAll("equipment[]").map(String),
  imageUrl: field(data, "imageUrl") || undefined,
});

const ROOM_ERRORS: Record<number, string> = {
  400: "Les informations de la salle ont été refusées. Vérifiez les champs.",
  403: "Vous n'avez pas les droits pour modifier cette salle.",
  404: "Cette salle n'existe plus.",
};

export const roomError = (status?: number) =>
  (status && ROOM_ERRORS[status]) ||
  "La salle n'a pas pu être enregistrée. Réessayez.";
