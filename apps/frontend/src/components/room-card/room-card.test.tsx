import { component$, Slot } from "@builder.io/qwik";
import { createDOM } from "@builder.io/qwik/testing";
import { QwikCityMockProvider } from "@builder.io/qwik-city";
import type { Room } from "@room-booking/core";
import { describe, expect, it } from "vitest";
import { useRoomImages } from "~/lib/image";
import { RoomCard } from "./room-card";

const Providers = component$(() => {
  useRoomImages();
  return (
    <QwikCityMockProvider>
      <Slot />
    </QwikCityMockProvider>
  );
});

const room: Room = {
  id: "room-01",
  name: "Salle Voltaire",
  capacity: 12,
  location: "Paris 11e",
  equipment: ['Écran 65"', "Wi-Fi"],
  pricePerHour: 45,
  status: "ACTIVE",
  imageUrl: "https://picsum.photos/seed/room-01/800/600",
};

async function renderCard(value: Room) {
  const { screen, render } = await createDOM();
  await render(
    <Providers>
      <RoomCard room={value} />
    </Providers>,
  );
  return screen;
}

describe("RoomCard", () => {
  it("renders name, link, location, capacity, price and equipment", async () => {
    const screen = await renderCard(room);
    const link = screen.querySelector("h3 a");
    expect(link?.textContent).toBe("Salle Voltaire");
    expect(link?.getAttribute("href")).toBe("/rooms/room-01/");
    expect(screen.textContent).toContain("Paris 11e");
    expect(screen.textContent).toContain("12 pers. max");
    expect(screen.textContent?.replace(/\s+/g, " ")).toContain("45 € / heure");
    expect(
      Array.from(screen.querySelectorAll("li"), (li) => li.textContent),
    ).toEqual(['Écran 65"', "Wi-Fi"]);
  });

  it("renders a decorative responsive photo", async () => {
    const screen = await renderCard(room);
    const img = screen.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("src")).toBe(room.imageUrl);
    expect(img?.getAttribute("srcset")).toContain("seed/room-01/400/300 400w");
  });

  it("rejects missing image and equipment: placeholder, no chip list, no throw", async () => {
    const screen = await renderCard({
      ...room,
      imageUrl: undefined,
      equipment: undefined,
    });
    expect(screen.querySelector("img")).toBeFalsy();
    expect(screen.querySelector("ul")).toBeFalsy();
    expect(screen.querySelector('[aria-hidden="true"] svg')).toBeTruthy();
  });

  it("flags an inactive room", async () => {
    const screen = await renderCard({ ...room, status: "INACTIVE" });
    expect(screen.textContent).toContain("Inactive");
    expect(screen.querySelector("img")?.getAttribute("class")).toContain(
      "grayscale",
    );
  });

  it("does not flag an active room", async () => {
    const screen = await renderCard(room);
    expect(screen.textContent).not.toContain("Inactive");
  });
});
