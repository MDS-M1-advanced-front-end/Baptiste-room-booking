import { createDOM } from "@builder.io/qwik/testing";
import { describe, expect, it } from "vitest";
import { Field, Input, fieldA11y } from "./field";

describe("Field", () => {
  it("links error and hint to the control", async () => {
    const { screen, render } = await createDOM();
    const props = {
      id: "capacity",
      label: "Capacité",
      hint: "En personnes",
      error: "Trop petit",
    };
    await render(
      <Field {...props} required>
        <Input {...fieldA11y(props)} />
      </Field>,
    );
    const input = screen.querySelector("input");
    expect(input?.getAttribute("aria-invalid")).toBe("true");
    expect(input?.getAttribute("aria-describedby")).toBe(
      "capacity-hint capacity-error",
    );
    expect(screen.querySelector("#capacity-error")?.textContent).toContain(
      "Trop petit",
    );
    expect(screen.querySelector("label")?.getAttribute("for")).toBe("capacity");
  });

  it("rejects invalid state without error: no error node, no aria-invalid", async () => {
    const { screen, render } = await createDOM();
    const props = { id: "name", label: "Nom" };
    await render(
      <Field {...props}>
        <Input {...fieldA11y(props)} />
      </Field>,
    );
    const input = screen.querySelector("input");
    expect(input?.hasAttribute("aria-invalid")).toBe(false);
    expect(input?.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.querySelector("#name-error")).toBeFalsy();
  });

  it("renders a suffix addon", async () => {
    const { screen, render } = await createDOM();
    await render(<Input id="price" suffix="€ / h" />);
    expect(screen.textContent).toContain("€ / h");
  });
});
