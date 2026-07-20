import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectImage from "@/components/ProjectImage";
import { type SceneVariant } from "@/components/ProjectScene";
import Reveal from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected landscape commissions across Biloxi, Ocean Springs, Gulfport, and the Mississippi Gulf Coast.",
};

const projects: {
  variant: SceneVariant;
  photo: string;
  photoAlt: string;
  title: string;
  place: string;
  year: string;
  scope: string[];
  story: string;
}[] = [
  {
    variant: "allee",
    photo:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=70",
    photoAlt:
      "Sunlight falling through a long allée of mature trees over a quiet drive",
    title: "The Oak Allée",
    place: "East Beach Boulevard, Biloxi",
    year: "2025",
    scope: ["Design & build", "Tree preservation", "Lighting"],
    story:
      "A 300-foot drive beneath twelve heritage live oaks, restored after decades of compaction. We decompacted the root zones by air spade, re-laid the drive in crushed shell, and hung moonlighting high in the canopies so the allée carries you to the door at any hour.",
  },
  {
    variant: "parterre",
    photo:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=70",
    photoAlt:
      "A home framed by a deep manicured lawn and layered foundation planting",
    title: "Rue Magnolia Parterre",
    place: "Historic Biloxi",
    year: "2024",
    scope: ["Formal garden", "Fountain", "Grounds care"],
    story:
      "A quarter-garden in the French manner behind an 1890s cottage: four beds of clipped boxwood about a cast-stone fountain, dwarf magnolia at the corners, and gravel raked weekly by our care crew. Small in plan, exact in execution.",
  },
  {
    variant: "coastal",
    photo:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "A broad green lawn edged with deep planted borders",
    title: "Davis Bayou Lawn",
    place: "Ocean Springs",
    year: "2024",
    scope: ["Shoreline planting", "Drainage", "Path work"],
    story:
      "Where a lawn meets a bayou, the edge is everything. We stepped the turf down through a band of sea oats and muhly grass, threaded an oyster-shell path to the water, and hid a French drain beneath the whole run so the lawn survives a wet October.",
  },
  {
    variant: "poolside",
    photo:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Still water reflecting the garden planted at its edge",
    title: "The Reflecting Pool",
    place: "Gulfport",
    year: "2023",
    scope: ["Water feature", "Hedging", "Stone work"],
    story:
      "A disciplined court: a limestone-edged reflecting pool held by a wall of clipped hedge spheres, with pavers set wide enough for an evening table. The water doubles the oaks above it — the cheapest square footage of garden we have ever built.",
  },
  {
    variant: "evening",
    photo:
      "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Warm garden lights glowing along a path at dusk",
    title: "Lantern Walk",
    place: "Pass Christian",
    year: "2023",
    scope: ["Lighting design", "Path work", "Planting"],
    story:
      "A client who entertains after dark asked for a garden that begins at dusk. Bronze path lanterns pace the walk at breathing intervals, uplights graze the oak bark, and the beds hold white blooms that carry the last light — a garden tuned for 9 p.m.",
  },
  {
    variant: "cottage",
    photo:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Hands tending a densely planted flower border in full bloom",
    title: "Ocean Springs Cottage Garden",
    place: "Ocean Springs",
    year: "2022",
    scope: ["Cottage borders", "Arbor", "Seasonal color"],
    story:
      "Loose where the others are formal: deep borders of salvia, coneflower, and old roses about a curving walk, under a cypress arbor built to fade silver. Planted for the owner to cut from — the house has not bought flowers since.",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        idPrefix="pf"
        eyebrow="Portfolio"
        title={
          <>
            Grounds we keep
            <br />
            company with
          </>
        }
        lede="Each commission is drawn from its own site and story — shown here in photographs and drawn plans."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28 space-y-24 sm:space-y-32">
          {projects.map((pr, i) => (
            <Reveal key={pr.title}>
              <article
                className={`grid gap-10 lg:gap-16 lg:grid-cols-2 items-center ${
                  i % 2 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ProjectImage
                  src={pr.photo}
                  alt={pr.photoAlt}
                  variant={pr.variant}
                  className="w-full aspect-[4/3]"
                />
                <div>
                  <p className="text-xs uppercase tracking-cap text-brass-deep">
                    {pr.place} — {pr.year}
                  </p>
                  <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">
                    {pr.title}
                  </h2>
                  <p className="mt-6 leading-relaxed text-ink/75">{pr.story}</p>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {pr.scope.map((s) => (
                      <li
                        key={s}
                        className="text-[0.68rem] uppercase tracking-[0.18em] border border-ink/25 text-ink/70 px-3 py-1.5"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-fern text-ivory grain relative">
        <div className="relative z-10 mx-auto max-w-3xl px-6 sm:px-8 py-20 sm:py-28 text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              The next garden on this page could be yours
            </h2>
            <div className="mt-9">
              <ButtonLink href="/contact">Start the Conversation</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
