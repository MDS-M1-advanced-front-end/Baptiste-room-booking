import { createDOM } from "@builder.io/qwik/testing";
import { describe, expect, it } from "vitest";
import type { ReservationStatus } from "@room-booking/core";
import { RESERVATION_STATUS_LABELS, StatusBadge } from "./badge";

describe("StatusBadge", () => {
  it.each(Object.entries(RESERVATION_STATUS_LABELS))(
    "renders %s as %s",
    async (status, label) => {
      const { screen, render } = await createDOM();
      await render(<StatusBadge status={status as ReservationStatus} />);
      expect(screen.textContent).toContain(label);
    },
  );

  it("rejects an unknown status: neutral tone with raw value, no throw", async () => {
    const { screen, render } = await createDOM();
    await render(<StatusBadge status={"FOO" as ReservationStatus} />);
    const badge = screen.querySelector("span");
    expect(badge?.textContent).toContain("FOO");
    expect(badge?.className).toContain("bg-(--color-surface-muted)");
  });
});
