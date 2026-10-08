import { describe, expect, it } from "vitest";
import type { PaginatedReservations, PaginatedRooms } from "@room-booking/core";
import rooms from "../../../../../mock/data/rooms.json";
import reservations from "../../../../../mock/data/reservations.json";
import users from "../../../../../mock/data/users.json";
import availability from "../../../../../mock/data/availability.json";
import {
  zAvailabilitySlot,
  zReservation,
  zRoom,
  zUser,
} from "../../../../../packages/core/src/api/generated/zod.gen";
import { emulateList, preferFor } from "./mock.server";

const login = (email: string) =>
  new Request("http://m/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "x" }),
  });
const get = (path: string) => new Request(`http://m${path}`);
const roomPage = {
  items: rooms,
  page: 1,
  pageSize: 20,
  total: rooms.length,
} as unknown as PaginatedRooms;
const reservationPage = {
  items: reservations,
  page: 1,
  pageSize: 20,
  total: reservations.length,
} as PaginatedReservations;

describe("preferFor", () => {
  it("maps login email to mock user example", async () => {
    expect(
      await preferFor(login("gestionnaire1@salles.example"), undefined),
    ).toBe("example=gestionnaire-1");
  });

  it("maps mock token to user example on /auth/me", async () => {
    expect(await preferFor(get("/auth/me"), "mock-token-client-1")).toBe(
      "example=client-1",
    );
  });

  it("maps room, user and reservation ids to their examples", async () => {
    expect(
      await preferFor(
        get("/rooms/00000000-0000-4000-8000-100000000003"),
        undefined,
      ),
    ).toBe("example=room-03");
    expect(
      await preferFor(
        get("/users/00000000-0000-4000-8000-200000000004"),
        undefined,
      ),
    ).toBe("example=gestionnaire-1");
    expect(
      await preferFor(get(`/reservations/${reservations[1].id}`), undefined),
    ).toBe(`example=${reservations[1].id}`);
  });

  it("rejects unknown email with a 401", async () => {
    expect(await preferFor(login("nobody@x.fr"), undefined)).toBe("code=401");
  });

  it("rejects unknown ids with a 404", async () => {
    expect(await preferFor(get("/rooms/unknown"), undefined)).toBe("code=404");
    expect(await preferFor(get("/reservations/unknown"), undefined)).toBe(
      "code=404",
    );
  });

  it("leaves sub-paths without example", async () => {
    expect(
      await preferFor(
        get("/rooms/00000000-0000-4000-8000-100000000003/availability"),
        undefined,
      ),
    ).toBeUndefined();
  });

  it("rejects /auth/me without a mock token", async () => {
    expect(await preferFor(get("/auth/me"), "real-jwt")).toBeUndefined();
  });
});

describe("emulateList", () => {
  it("filters rooms by search, location and capacity then paginates", () => {
    const result = emulateList(
      new URL(
        "http://m/rooms?location=Lyon%20Part-Dieu&capacityMin=1&page=1&pageSize=2",
      ),
      roomPage,
      undefined,
    ) as PaginatedRooms;
    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(
      result.items.every((room) => room.location === "Lyon Part-Dieu"),
    ).toBe(true);
  });

  it("matches search on name case-insensitively", () => {
    const result = emulateList(
      new URL("http://m/rooms?search=voltaire"),
      roomPage,
      undefined,
    ) as PaginatedRooms;
    expect(result.items.map((room) => room.name)).toEqual(["Salle Voltaire"]);
  });

  it("scopes reservations to the client and status", () => {
    const result = emulateList(
      new URL("http://m/reservations?status=PENDING"),
      reservationPage,
      "mock-token-client-1",
    ) as PaginatedReservations;
    expect(result.items.map((r) => r.status)).toEqual(["PENDING"]);
    expect(
      result.items.every(
        (r) => r.userId === "00000000-0000-4000-8000-200000000001",
      ),
    ).toBe(true);
  });

  it("scopes reservations to rooms owned by the gestionnaire", () => {
    const owned = new Set(
      rooms
        .filter((r) => r.ownerId === "00000000-0000-4000-8000-200000000004")
        .map((r) => r.id),
    );
    const result = emulateList(
      new URL("http://m/reservations"),
      reservationPage,
      "mock-token-gestionnaire-1",
    ) as PaginatedReservations;
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((r) => owned.has(r.roomId))).toBe(true);
  });

  it("rejects reservations without a known viewer: empty list", () => {
    const result = emulateList(
      new URL("http://m/reservations"),
      reservationPage,
      undefined,
    ) as PaginatedReservations;
    expect(result.items).toEqual([]);
  });

  it("rejects non list paths: body untouched", () => {
    const body = { id: "x" };
    expect(emulateList(new URL("http://m/rooms/x"), body, undefined)).toBe(
      body,
    );
  });
});

describe("mock data matches the contract the sdk validates", () => {
  it.each([
    ["rooms", rooms, zRoom],
    ["users", users, zUser],
    ["reservations", reservations, zReservation],
    ["availability", availability, zAvailabilitySlot],
  ] as const)("%s", (_, items, schema) => {
    for (const item of items)
      expect(schema.safeParse(item).error).toBeUndefined();
  });

  it("rejects a slot with seconds", () => {
    expect(
      zAvailabilitySlot.safeParse({
        startTime: "08:00:00",
        endTime: "09:00",
        available: true,
      }).success,
    ).toBe(false);
  });
});
