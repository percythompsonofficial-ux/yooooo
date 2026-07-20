"use client";

import { useState } from "react";
import RoofScene from "./RoofScene";

/**
 * Real photo with graceful fallback:
 *   1. company photo in /public/photos (any of .jpg/.jpeg/.png/.webp)
 *   2. fallbackSrc — stock photo, so real imagery shows today
 *   3. the rooftop illustration — only if no photo can load
 */
function buildCandidates(src: string, fallbackSrc?: string): string[] {
  const list: string[] = [];
  if (src.startsWith("/")) {
    const b = src.replace(/\.[a-z0-9]+$/i, "");
    for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) list.push(b + ext);
  } else {
    list.push(src);
  }
  if (fallbackSrc) list.push(fallbackSrc);
  return list;
}

export default function ProjectImage({
  src,
  fallbackSrc,
  alt,
  idPrefix = "ri",
  className = "",
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  idPrefix?: string;
  className?: string;
}) {
  const candidates = buildCandidates(src, fallbackSrc);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const currentSrc = idx < candidates.length ? candidates[idx] : undefined;
  const showScene = !currentSrc;

  return (
    <div className={`relative overflow-hidden bg-slate ${className}`}>
      {(!loaded || showScene) && (
        <RoofScene idPrefix={idPrefix} className="absolute inset-0 w-full h-full" />
      )}
      {!showScene && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setIdx((i) => i + 1)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
