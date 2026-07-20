"use client";

import { useState } from "react";
import RoofScene from "./RoofScene";

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

export default function HeroBg({
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
    <div className="absolute inset-0 overflow-hidden bg-slate">
      {(!loaded || showScene) && (
        <RoofScene idPrefix={idPrefix} className="absolute inset-0 w-full h-full" />
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
      {/* slate overlays for legibility */}
      <div className="absolute inset-0 bg-slate/72" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate via-slate/70 to-slate/40" />
    </div>
  );
}
