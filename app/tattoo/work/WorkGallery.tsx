"use client";

import { useState } from "react";
import FlashCard from "@/components/tattoo/FlashCard";
import { site } from "@/lib/tattoo-site";

const artists = ["All", ...new Set(site.flash.map((f) => f.artist))];

export default function WorkGallery() {
  const [active, setActive] = useState("All");
  const items =
    active === "All" ? site.flash : site.flash.filter((f) => f.artist === active);

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <div role="group" aria-label="Filter flash by artist" className="flex flex-wrap gap-2">
        {artists.map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={active === a}
            onClick={() => setActive(a)}
            className={`font-mono text-[0.65rem] uppercase tracking-[0.18em] px-4 py-2.5 border transition-colors duration-200 cursor-pointer ${
              active === a
                ? "bg-volt text-void border-volt"
                : "border-salt/25 text-salt/80 hover:border-volt hover:text-volt"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <li key={f.name}>
            <FlashCard item={f} />
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        Showing {items.length} flash designs
        {active !== "All" ? ` drawn by ${active}` : ""}.
      </p>
    </section>
  );
}
