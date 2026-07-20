"use client";

import { useState } from "react";
import ProjectScene, { type SceneVariant } from "./ProjectScene";

/**
 * Shows a real photograph, with graceful degradation:
 *   1. `src`        — the company's own photo in /public/photos (if present)
 *   2. `fallbackSrc`— a stock photo, so the site shows real imagery today
 *   3. the drawn illustration — only if no photo can load at all
 */
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
          onError={handleError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
