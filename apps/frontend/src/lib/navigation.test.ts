import { describe, expect, it } from "vitest";
import { isCurrent, isManager, navItems } from "./navigation";

describe("navItems", () => {
  it("shows only the catalogue to visitors", () => {
    expect(navItems(null, 0).map((item) => item.label)).toEqual(["Catalogue"]);
  });

  it("adds bookings for a client", () => {
    expect(navItems({ role: "CLIENT" }, 3).map((item) => item.href)).toEqual([
      "/rooms/",
      "/bookings/",
    ]);
  });

  it("adds rooms and requests with the pending count for a gestionnaire", () => {
    const items = navItems({ role: "GESTIONNAIRE" }, 2);
    expect(items.map((item) => item.label)).toEqual([
      "Catalogue",
      "Mes salles",
      "Demandes",
    ]);
    expect(items[2].count).toBe(2);
  });

  it("rejects manager links for a client", () => {
    expect(
      navItems({ role: "CLIENT" }, 0).some((item) =>
        item.href.startsWith("/manage"),
      ),
    ).toBe(false);
  });
});

describe("isManager", () => {
  it("accepts gestionnaire and administrateur", () => {
    expect(isManager({ role: "GESTIONNAIRE" })).toBe(true);
    expect(isManager({ role: "ADMINISTRATEUR" })).toBe(true);
  });

  it("rejects client and visitor", () => {
    expect(isManager({ role: "CLIENT" })).toBe(false);
    expect(isManager(null)).toBe(false);
  });
});

describe("isCurrent", () => {
  it("marks catalogue on the list and on a room page", () => {
    expect(isCurrent("/rooms/", "/rooms/")).toBe(true);
    expect(isCurrent("/rooms/abc/", "/rooms/")).toBe(true);
    expect(isCurrent("/bookings/abc/edit/", "/bookings/")).toBe(true);
  });

  it("rejects unrelated sections", () => {
    expect(isCurrent("/bookings/", "/rooms/")).toBe(false);
    expect(isCurrent("/manage/rooms/", "/manage/requests/")).toBe(false);
  });
});
