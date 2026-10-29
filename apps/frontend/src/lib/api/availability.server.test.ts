import { describe, expect, it } from "vitest";
import { bookableDay } from "./availability.server";

const today = "2026-10-07";

describe("bookableDay", () => {
  it("keeps a valid future requested day", () => {
    expect(bookableDay("2026-11-16", today, today)).toBe("2026-11-16");
  });

  it("falls back to the booking day when nothing is requested", () => {
    expect(bookableDay(null, "2026-10-12", today)).toBe("2026-10-12");
  });

  it.each(["nope", "2026-13-45", "2020-01-01"])(
    "rejects requested %s",
    (requested) => {
      expect(bookableDay(requested, today, today)).toBe(today);
    },
  );

  it("rejects a past fallback: today", () => {
    expect(bookableDay(null, "2026-10-01", today)).toBe(today);
  });
});
