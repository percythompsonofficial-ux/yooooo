"use client";

import { useState } from "react";
import ProjectScene, { type SceneVariant } from "./ProjectScene";

/**
 * Shows a real photograph, trying sources in order:
 *   1. the company's own photo in /public/photos — any of .jpg/.jpeg/.png/.webp
 *   2. `fallbackSrc` — a stock photo, so the site shows real imagery today
 *   3. the drawn illustration — only if no photo can load at all
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

export default function ProjectImage({
  src,
  fallbackSrc,
  alt,
  variant,
  className = "",
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  variant: SceneVariant;
  className?: string;
}) {
  const candidates = buildCandidates(src, fallbackSrc);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentSrc = idx < candidates.length ? candidates[idx] : undefined;
  const showScene = !currentSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {(!loaded || showScene) && (
        <ProjectScene
          variant={variant}
          title={showScene ? alt : undefined}
          className="absolute inset-0 w-full h-full"
        />
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
