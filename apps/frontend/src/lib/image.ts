import { $ } from "@builder.io/qwik";
import { useImageProvider, type ImageTransformerProps } from "qwik-image";

const DIMENSIONS = /\/(\d+)\/(\d+)$/;
const ROOM_IMAGE_WIDTHS = [320, 400, 640, 800];

export function resizeImage({ src, width, height }: ImageTransformerProps) {
  const match = DIMENSIONS.exec(src);
  if (!match) return src;
  const ratio = Number(match[2]) / Number(match[1]);
  return src.replace(
    DIMENSIONS,
    `/${width}/${height ?? Math.round(width * ratio)}`,
  );
}

export function roomImageSrcSet(src: string) {
  if (!DIMENSIONS.test(src)) return undefined;
  return ROOM_IMAGE_WIDTHS.map(
    (width) => `${resizeImage({ src, width, height: undefined })} ${width}w`,
  ).join(", ");
}

export const useRoomImages = () =>
  useImageProvider({
    resolutions: [400, 800, 1200],
    imageTransformer$: $(resizeImage),
  });
