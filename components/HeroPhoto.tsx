"use client";

import { useState } from "react";
import OakScene from "./OakScene";

/**
 * Full-bleed hero background photo with a dark overlay for text legibility.
 * Order: company photo (/public/photos, any of .jpg/.jpeg/.png/.webp) →
 * stock photo → oak illustration.
 */
function buildCandidates(src: string, fallbackSrc?: string): string[] {
  const list: string[] = [];
  if (src.startsWith("/")) {
    const base = src.replace(/\.[a-z0-9]+$/i, "");
    for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) list.push(base + ext);
  } else {
    list.push(src);
  }
  if (fallbackSrc) list.push(fallbackSrc);
  return list;
}

export default function HeroPhoto({
  src,
  fallbackSrc,
  idPrefix,
}: {
  src: string;
  fallbackSrc?: string;
  idPrefix: string;
}) {
  const candidates = buildCandidates(src, fallbackSrc);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentSrc = idx < candidates.length ? candidates[idx] : undefined;
  const showScene = !currentSrc;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {(!loaded || showScene) && (
        <OakScene className="absolute inset-0 w-full h-full" idPrefix={idPrefix} />
      )}
      {!showScene && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setLoaded(true)}
          onError={() => setIdx((i) => i + 1)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {/* Legibility overlay — keeps the wordmark readable over any photo */}
      <div className="absolute inset-0 bg-pine/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-pine/50 via-pine/25 to-pine" />
    </div>
  );
}
