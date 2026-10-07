import { describe, expect, it } from "vitest";
import { resizeImage } from "./image";

describe("resizeImage", () => {
  it("rewrites trailing dimensions keeping the source ratio", () => {
    expect(
      resizeImage({
        src: "https://picsum.photos/seed/room-01/800/600",
        width: 400,
        height: undefined,
      }),
    ).toBe("https://picsum.photos/seed/room-01/400/300");
  });

  it("uses an explicit height when given", () => {
    expect(
      resizeImage({
        src: "https://picsum.photos/seed/room-01/800/600",
        width: 400,
        height: 100,
      }),
    ).toBe("https://picsum.photos/seed/room-01/400/100");
  });

  it.each(["https://cdn.example/room.jpg", "/images/room.png", ""])(
    "leaves %s untouched when it has no dimensions",
    (src) => {
      expect(resizeImage({ src, width: 400, height: undefined })).toBe(src);
    },
  );
});
