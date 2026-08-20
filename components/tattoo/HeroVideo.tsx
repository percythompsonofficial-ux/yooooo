"use client";

import { useEffect, useState } from "react";

/**
 * A short looping clip behind the hero.
 *
 * Renders the poster frame on the server and swaps the video in after mount,
 * so the still is what paints first and the video never autoplays for someone
 * who has asked for reduced motion.
 */
export default function HeroVideo({
  sources,
  poster,
  objectPosition,
  className = "",
}: {
  /** In preference order. WebM first, with MP4 for Safari and iOS. */
  sources: { src: string; type: string }[];
  poster: string;
  objectPosition?: string;
  className?: string;
}) {
  const [play, setPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlay(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const fill = "absolute inset-0 w-full h-full object-cover";
  const style = objectPosition ? { objectPosition } : undefined;

  return (
    <div className={`overflow-hidden bg-char ${className}`}>
      {play && !failed ? (
        <video
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setFailed(true)}
          className={fill}
          style={style}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" className={fill} style={style} />
      )}
    </div>
  );
}
