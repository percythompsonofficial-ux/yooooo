"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A photograph of the studio's work.
 *
 * Shows the file at `src` when there is one. Until then it holds the space
 * with a plain panel — no stand-in artwork, so nothing on the page can be
 * mistaken for the shop's own work.
 */
export default function TattooImage({
  src = "",
  alt,
  label,
  className = "",
  imgClassName = "",
}: {
  /** Path under /public, e.g. "/photos/tattoo/work-01.jpg". Empty = no photo yet. */
  src?: string;
  alt: string;
  /** Shown in the empty state so the slot is identifiable. */
  label?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const showPhoto = Boolean(src) && !failed;

  // A cached image can finish loading before React attaches onLoad, which
  // would leave it faded out forever — catch that case on mount.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  // `relative` would collide with a caller-supplied absolute/fixed position and
  // collapse the box, so only apply it when the caller hasn't set one.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);

  return (
    <div
      className={`${positioned ? "" : "relative"} overflow-hidden bg-char ${className}`}
    >
      {(!loaded || !showPhoto) && (
        <div className="absolute inset-0 grid place-items-center border border-salt/10 px-4 text-center">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-smoke">
            {label ?? "Photo coming"}
          </span>
        </div>
      )}
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setFailed(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
