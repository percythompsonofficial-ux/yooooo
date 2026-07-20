"use client";

import { useState } from "react";
import OakScene from "./OakScene";

/**
 * Full-bleed hero background photo with a dark overlay for text legibility.
 * Order: company photo (/public/photos) → stock photo → oak illustration.
 */
export default function HeroPhoto({
  src,
  fallbackSrc,
  idPrefix,
}: {
  src: string;
  fallbackSrc?: string;
  idPrefix: string;
}) {
  const [stage, setStage] = useState<"primary" | "fallback" | "failed">(
    "primary",
  );
  const [loaded, setLoaded] = useState(false);

  const currentSrc = stage === "primary" ? src : fallbackSrc;
  const showScene = stage === "failed" || !currentSrc;

  function handleError() {
    if (stage === "primary" && fallbackSrc) {
      setStage("fallback");
    } else {
      setStage("failed");
    }
  }

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
          onError={handleError}
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
