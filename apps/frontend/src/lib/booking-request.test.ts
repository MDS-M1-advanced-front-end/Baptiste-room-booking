import { describe, expect, it } from "vitest";
import { capacityError, reservationTimes } from "./booking-request";

describe("reservationTimes", () => {
  it("builds the UTC request body from a Paris slot", () => {
    expect(
      reservationTimes({
        date: "2026-11-16",
        startTime: "15:00",
        endTime: "18:00",
        numberOfParticipants: 8,
        comment: "",
      }),
    ).toEqual({
      startAt: "2026-11-16T14:00:00.000Z",
      endAt: "2026-11-16T17:00:00.000Z",
      numberOfParticipants: 8,
      comment: undefined,
    });
  });
});

describe("capacityError", () => {
  it("accepts a group within capacity", () => {
    expect(capacityError(12, 12)).toBeUndefined();
  });

  it("rejects a group above capacity", () => {
    expect(capacityError(12, 13)).toBe(
      "La salle accueille 12 personnes au maximum.",
    );
  });
});
