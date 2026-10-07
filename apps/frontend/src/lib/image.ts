import { $ } from '@builder.io/qwik';
import { useImageProvider, type ImageTransformerProps } from 'qwik-image';

const DIMENSIONS = /\/(\d+)\/(\d+)$/;

export function resizeImage({ src, width, height }: ImageTransformerProps) {
  const match = DIMENSIONS.exec(src);
  if (!match) return src;
  const ratio = Number(match[2]) / Number(match[1]);
  return src.replace(DIMENSIONS, `/${width}/${height ?? Math.round(width * ratio)}`);
}

export const useRoomImages = () =>
  useImageProvider({ resolutions: [400, 800, 1200, 1600], imageTransformer$: $(resizeImage) });
