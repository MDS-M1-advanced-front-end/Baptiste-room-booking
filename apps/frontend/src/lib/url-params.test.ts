import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  RESERVATION_STATUSES,
  isoDate,
  parseRoomsQuery,
  parseStatus,
  positiveInt,
  timeOfDay,
} from "./url-params";

describe("positiveInt", () => {
  it.each([
    ["1", 1],
    ["42", 42],
  ])("accepts %s", (input, output) => {
    expect(positiveInt(input)).toBe(output);
  });

  it.each(["abc", "0", "-1", "1.5", "", null, "1e3x"])(
    "rejects %s",
    (input) => {
      expect(positiveInt(input)).toBeUndefined();
    },
  );
});

describe("isoDate", () => {
  it.each(["2026-10-08", "2028-02-29"])("accepts %s", (input) => {
    expect(isoDate(input)).toBe(input);
  });

  it.each([
    "nope",
    "2026-13-45",
    "2026-02-30",
    "2027-02-29",
    "08/10/2026",
    "",
    null,
  ])("rejects %s", (input) => {
    expect(isoDate(input)).toBeUndefined();
  });
});

describe("timeOfDay", () => {
  it.each(["08:00", "23:59"])("accepts %s", (input) => {
    expect(timeOfDay(input)).toBe(input);
  });

  it.each(["24:00", "8:00", "08:60", "noon", "", null])(
    "rejects %s",
    (input) => {
      expect(timeOfDay(input)).toBeUndefined();
    },
  );
});

describe("parseRoomsQuery", () => {
  it("parses the full filter set", () => {
    expect(
      parseRoomsQuery(
        new URLSearchParams(
          "search=salle&location=Paris+11e&capacityMin=4&capacityMax=20&date=2026-10-08&startTime=09:00&endTime=12:00&available=true&page=2",
        ),
      ),
    ).toEqual({
      search: "salle",
      location: "Paris 11e",
      capacityMin: 4,
      capacityMax: 20,
      date: "2026-10-08",
      startTime: "09:00",
      endTime: "12:00",
      available: true,
      page: 2,
      pageSize: PAGE_SIZE,
    });
  });

  it("defaults to the first page without filters", () => {
    expect(parseRoomsQuery(new URLSearchParams())).toEqual({
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });

  it("accepts the checkbox default value", () => {
    expect(parseRoomsQuery(new URLSearchParams("available=on")).available).toBe(
      true,
    );
  });

  it.each(["page=abc", "page=0", "page=-1", "page=1.5"])(
    "rejects bad page %s -> 1",
    (query) => {
      expect(parseRoomsQuery(new URLSearchParams(query)).page).toBe(1);
    },
  );

  it.each([
    "capacityMin=-3",
    "capacityMin=abc",
    "capacityMax=0",
    "date=nope",
    "date=2026-13-45",
    "startTime=25:00",
    "available=false",
    "search=",
  ])("drops bad filter %s", (query) => {
    expect(parseRoomsQuery(new URLSearchParams(query))).toEqual({
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });
});

describe("parseStatus", () => {
  it.each(RESERVATION_STATUSES)("accepts %s", (status) => {
    expect(parseStatus(status)).toBe(status);
  });

  it.each(["FOO", "confirmed", "", null])("rejects %s", (status) => {
    expect(parseStatus(status)).toBeUndefined();
  });
});
