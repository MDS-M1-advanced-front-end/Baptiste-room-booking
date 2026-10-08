import { describe, expect, it } from "vitest";
import type { User } from "@room-booking/core";
import {
  HOME,
  USER_KEY,
  requireRole,
  requireUser,
  safeRedirect,
} from "./auth.server";

const client = {
  id: "c",
  firstName: "Léa",
  lastName: "Martin",
  email: "l@x.fr",
  role: "CLIENT",
} as User;
const manager = { ...client, id: "m", role: "GESTIONNAIRE" } as User;

function event(user?: User) {
  const sharedMap = new Map<string, unknown>(user ? [[USER_KEY, user]] : []);
  return {
    sharedMap,
    url: new URL("http://x/bookings/?status=PENDING"),
    redirect: (status: 302, url: string) => ({ status, url }),
  } as never;
}

const thrown = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error("expected a redirect");
};

describe("safeRedirect", () => {
  it.each(["/rooms/", "/bookings/?status=PENDING", "/rooms/abc/"])(
    "keeps internal path %s",
    (path) => {
      expect(safeRedirect(path)).toBe(path);
    },
  );

  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("rejects %s", (path) => {
    expect(safeRedirect(path)).toBe(HOME);
  });
});

describe("requireUser", () => {
  it("returns the session user", () => {
    expect(requireUser(event(client))).toBe(client);
  });

  it("rejects a visitor with a redirect to login keeping the target", () => {
    expect(thrown(() => requireUser(event()))).toEqual({
      status: 302,
      url: "/login/?redirect=%2Fbookings%2F%3Fstatus%3DPENDING",
    });
  });
});

describe("requireRole", () => {
  it("lets a gestionnaire through manager routes", () => {
    expect(
      requireRole(event(manager), ["GESTIONNAIRE", "ADMINISTRATEUR"]),
    ).toBe(manager);
  });

  it("rejects a client on manager routes", () => {
    expect(
      thrown(() =>
        requireRole(event(client), ["GESTIONNAIRE", "ADMINISTRATEUR"]),
      ),
    ).toEqual({
      status: 302,
      url: HOME,
    });
  });
});
