"use client";

import { useState } from "react";
import FlashArt, { type FlashDesign } from "./FlashArt";

/**
 * Shows a real photograph, trying sources in order:
 *   1. the studio's own photo, when `src` names one (any extension)
 *   2. `fallbackSrc` — an optional explicit URL, if one is supplied
 *   3. the studio's own drawn flash — the default until photos are added
 */
function buildCandidates(src: string, fallbackSrc?: string): string[] {
  const list: string[] = [];
  // No photo configured — show the studio's flash and make no requests at all.
  if (!src) return fallbackSrc ? [fallbackSrc] : [];
  if (src.startsWith("/")) {
    const base = src.replace(/\.[a-z0-9]+$/i, "");
    for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) list.push(base + ext);
  } else {
    list.push(src);
  }
  if (fallbackSrc) list.push(fallbackSrc);
  return list;
}

export default function TattooImage({
  src = "",
  fallbackSrc,
  alt,
  design,
  className = "",
  imgClassName = "",
}: {
  /** Path under /public, e.g. "/photos/tattoo/hero". Empty = flash only. */
  src?: string;
  fallbackSrc?: string;
  alt: string;
  design: FlashDesign;
  className?: string;
  imgClassName?: string;
}) {
  const candidates = buildCandidates(src, fallbackSrc);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentSrc = idx < candidates.length ? candidates[idx] : undefined;
  const showScene = !currentSrc;

  // `relative` would collide with a caller-supplied absolute/fixed position and
  // collapse the box, so only apply it when the caller hasn't set one.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);

  return (
    <div
      className={`${positioned ? "" : "relative"} overflow-hidden bg-char ${className}`}
    >
      {(!loaded || showScene) && (
        <FlashArt design={design} className="absolute inset-0 w-full h-full" />
      )}
      {showScene && alt !== "" && (
        <span className="sr-only">Original flash artwork drawn by the studio.</span>
      )}
      {!showScene && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setIdx((i) => i + 1);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
