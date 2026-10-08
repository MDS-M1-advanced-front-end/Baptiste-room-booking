import type { RequestEventBase } from "@builder.io/qwik-city";
import { createClient, type Client } from "@room-booking/core";
import { readToken } from "~/lib/session.server";
import { withMock } from "~/lib/api/mock.server";

const MOCK_API_URL = "http://localhost:4010";

export function api(event: RequestEventBase): Client {
  const token = readToken(event.cookie);
  const baseUrl = event.env.get("API_URL");
  const client = createClient({
    baseUrl: baseUrl ?? MOCK_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!baseUrl) withMock(client, token);
  return client;
}
