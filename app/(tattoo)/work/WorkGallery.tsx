"use client";

import { useState } from "react";
import WorkCard from "@/components/tattoo/WorkCard";
import { site } from "@/lib/tattoo-site";

const styles = ["All", ...new Set(site.work.map((w) => w.style))];

export default function WorkGallery() {
  const [active, setActive] = useState("All");
  const items = active === "All" ? site.work : site.work.filter((w) => w.style === active);

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <div role="group" aria-label="Filter work by style" className="flex flex-wrap gap-2">
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={active === s}
            onClick={() => setActive(s)}
            className={`font-mono text-[0.65rem] uppercase tracking-[0.18em] px-4 py-2.5 border transition-colors duration-200 cursor-pointer ${
              active === s
                ? "bg-volt text-void border-volt"
                : "border-salt/25 text-salt/80 hover:border-volt hover:text-volt"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((w) => (
          <li key={w.slug}>
            <WorkCard item={w} />
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        Showing {items.length} pieces{active !== "All" ? ` in ${active}` : ""}.
      </p>
    </section>
  );
}
