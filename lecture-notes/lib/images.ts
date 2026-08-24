"use client";

/**
 * A phone camera produces a 12-megapixel, four-megabyte JPEG. Storing thirty of
 * those per lecture would eat a device's quota faster than the audio does, and
 * sending them to a vision model at full size buys nothing — anything past
 * about 1568px on the long edge gets scaled down on arrival anyway.
 *
 * So every photo is resized once, on the way in, and the original is discarded.
 */

const MAX_EDGE = 1568;
const JPEG_QUALITY = 0.82;

export type PreparedImage = {
  blob: Blob;
  width: number;
  height: number;
};

/**
 * Phones record orientation in EXIF rather than rotating the pixels, so a photo
 * taken in portrait arrives sideways unless it's decoded orientation-aware.
 * `createImageBitmap` can do that; where it can't, an <img> element applies EXIF
 * on its own.
 */
async function decode(file: Blob): Promise<
  | { kind: "bitmap"; image: ImageBitmap }
  | { kind: "element"; image: HTMLImageElement; url: string }
> {
  try {
    const image = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return { kind: "bitmap", image };
  } catch {
    const url = URL.createObjectURL(file);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Couldn't read that image."));
      image.src = url;
    });
    return { kind: "element", image, url };
  }
}

export async function prepareSlide(file: Blob): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image.");
  }

  const decoded = await decode(file);
  const source = decoded.image;
  const sw = source.width;
  const sh = source.height;

  if (sw === 0 || sh === 0) throw new Error("That image is empty.");

  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't process images.");
  ctx.drawImage(source, 0, 0, width, height);

  if (decoded.kind === "bitmap") decoded.image.close();
  else URL.revokeObjectURL(decoded.url);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("Couldn't process that photo.");

  return { blob, width, height };
}
