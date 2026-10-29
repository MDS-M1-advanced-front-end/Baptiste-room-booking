import type { RequestEventBase } from "@builder.io/qwik-city";
import { createClient, type Client } from "@room-booking/core";
import { readToken } from "~/lib/session.server";
import { withMock } from "~/lib/api/mock.server";

const MOCK_API_URL = "http://localhost:4010";

export function api(event: RequestEventBase): Client {
  const token = readToken(event.cookie);
  const baseUrl = event.env.get("API_URL");
  // Mock accepts any password and forges identity from the cookie: dev only.
  if (!baseUrl && !import.meta.env.DEV) {
    throw new Error("API_URL must be set outside dev (mock is dev-only)");
  }
  const client = createClient({
    baseUrl: baseUrl ?? MOCK_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!baseUrl && import.meta.env.DEV) withMock(client, token);
  return client;
}
