import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { OakLeafMark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "About",
  description:
    "Beau Jardin Landscape Co. — a Biloxi landscape studio practicing estate-grade design, build, and grounds care on the Mississippi Gulf Coast since 2009.",
};

const values = [
  {
    title: "The oaks come first",
    body: "Some of our clients' trees predate the United States. Every plan we draw begins with what must be protected, then designs the garden around it.",
  },
  {
    title: "Built for this coast",
    body: "Salt wind, sand, hurricanes, hundred-inch rains. We choose plants and build details for the Gulf Coast that exists — not the one in a catalog.",
  },
  {
    title: "Kept, not just installed",
    body: "A garden is a practice, not a purchase. Most of our commissions stay with us for grounds care, and the work gets better every year we keep it.",
  },
  {
    title: "One crew, one standard",
    body: "Design, build, and care under one roof. The person who drew your plan walks your grounds during construction and after.",
  },
];

const stats = [
  ["2009", "Studio founded in Biloxi"],
  ["140+", "Gardens designed & built"],
  ["60", "Estates under standing care"],
  ["0", "Heritage oaks lost on our watch"],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        idPrefix="ab"
        eyebrow="About the studio"
        title={
          <>
            Gardeners to the
            <br />
            Gulf Coast
          </>
        }
        lede="Beau Jardin — 'beautiful garden' — borrows its name from the French who laid out this coast three centuries ago."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <p className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.5]">
              <span className="font-display float-left text-[4.4em] leading-[0.8] pr-3 pt-1 text-brass-deep" aria-hidden="true">
                B
              </span>
              iloxi was drawn by French hands in 1699, and the town has never
              lost the habit: gardens here still answer to shade, salt, and
              company on the porch. Beau Jardin began in 2009 with one truck,
              a set of hand tools, and a conviction that the coast deserved
              gardens built to its own character — not imported from somewhere
              with easier weather.
            </p>
            <p className="mt-8 leading-relaxed text-ink/75">
              Sixteen years on, we are a studio of designers, horticulturists,
              masons, and grounds crews serving the beachfront and back-bay
              neighborhoods from Bay St. Louis to Ocean Springs. The work ranges
              from formal parterres behind historic cottages to shoreline lawns
              that step down into the bayou — all of it drawn, built, and kept
              by the same hands.
            </p>
          </Reveal>

          <Reveal className="mt-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-ink/20">
              {stats.map(([n, label], i) => (
                <div
                  key={label}
                  className={`p-6 sm:p-8 text-center border-ink/20 ${
                    i % 2 === 0 ? "border-r" : ""
                  } ${i < 2 ? "border-b lg:border-b-0" : ""} ${
                    i === 1 ? "lg:border-r" : ""
                  } ${i === 2 ? "lg:border-r" : ""}`}
                >
                  <p className="font-display text-4xl sm:text-5xl font-medium text-brass-deep tabular-nums">
                    {n}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink/60 leading-relaxed">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-parchment text-ink">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <SectionHeading center eyebrow="How we practice" title="Four convictions" />
          </Reveal>
          <div className="mt-14 grid gap-x-14 gap-y-12 sm:grid-cols-2 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div>
                  <OakLeafMark className="w-9 h-9 text-brass-deep" />
                  <h3 className="mt-5 font-display text-2xl font-semibold">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pine text-ivory grain relative">
        <div className="relative z-10 mx-auto max-w-3xl px-6 sm:px-8 py-20 sm:py-28 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-cap text-brass">
              Licensed & insured · Mississippi landscape contractor
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              Come walk your grounds with us
            </h2>
            <div className="mt-9">
              <ButtonLink href="/contact">Meet the Studio</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
