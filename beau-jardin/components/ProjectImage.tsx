"use client";

import { useState } from "react";
import ProjectScene, { type SceneVariant } from "./ProjectScene";

/**
 * Photo with illustrated fallback: the drawn scene shows until the photo
 * loads, and remains if the photo ever fails — no broken images.
 */
export default function ProjectImage({
  src,
  alt,
  variant,
  className = "",
}: {
  src: string;
  alt: string;
  variant: SceneVariant;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {(!loaded || failed) && (
        <ProjectScene
          variant={variant}
          title={failed ? alt : undefined}
          className="absolute inset-0 w-full h-full"
        />
      )}
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
