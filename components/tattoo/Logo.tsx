"use client";

import { useState } from "react";
import { site } from "@/lib/tattoo-site";

/**
 * The studio's logo mark. Renders the artwork once a file exists at
 * `/brand/inkdupjo.png`; until then it sets the name in type so the header
 * is never empty. `hasFile` gates the request so an absent logo costs
 * nothing on every page load.
 */
const LOGO_SRC = "/photos/tattoo/brand-logo.png";

export default function Logo({
  className = "h-11 w-11",
  wordmarkClassName = "text-2xl",
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!LOGO_SRC || failed) {
    return (
      <span
        className={`font-display font-extrabold uppercase tracking-[0.06em] leading-none ${wordmarkClassName}`}
      >
        {site.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt={site.fullName}
      onError={() => setFailed(true)}
      className={`${className} rounded-full object-contain`}
    />
  );
}
