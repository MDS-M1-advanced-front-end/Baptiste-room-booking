import { getRooms } from "@room-booking/core";
import { describe, expect, it } from "vitest";
import { api } from "./client.server";

const event = (apiUrl?: string) =>
  ({
    cookie: { get: () => null },
    env: { get: (key: string) => (key === "API_URL" ? apiUrl : undefined) },
  }) as never;

describe("api client", () => {
  it("rejects an unreachable server as an error result instead of throwing", async () => {
    const result = await getRooms({ client: api(event("http://127.0.0.1:1")) });
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });
});
