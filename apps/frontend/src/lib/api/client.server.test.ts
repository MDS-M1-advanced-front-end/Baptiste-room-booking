import { listRooms } from "@room-booking/core";
import { describe, expect, it, vi } from "vitest";
import { api } from "./client.server";

const event = (apiUrl?: string) =>
  ({
    cookie: { get: () => null },
    env: { get: (key: string) => (key === "API_URL" ? apiUrl : undefined) },
  }) as never;

describe("api client", () => {
  it("rejects an unreachable server as an error result instead of throwing", async () => {
    const result = await listRooms({
      client: api(event("http://127.0.0.1:1")),
    });
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });
});

describe("api client outside dev", () => {
  it("throws when API_URL is unset instead of falling back to the mock", () => {
    vi.stubEnv("DEV", "");
    try {
      expect(() => api(event())).toThrow("API_URL must be set");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
