import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { OakLeafMark } from "@/components/Wordmark";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Songy Brothers Lawn & Landscape is a family-owned lawn care and landscaping company serving the Mississippi Gulf Coast — Biloxi, Gulfport, Ocean Springs, and beyond.",
};

const values = [
  {
    title: "Best price, highest quality",
    body: "Our whole approach in one line: fair, honest pricing and work we'd be proud to put our own name on. No cutting corners, no surprise charges.",
  },
  {
    title: "Family owned & operated",
    body: "You're not dealing with a call center. You're dealing with the brothers whose name is on the truck, and a crew that treats your yard like their own.",
  },
  {
    title: "The same crew, every time",
    body: "Consistency is what keeps a yard looking cared-for. You get people who know your property, so nothing gets missed from one visit to the next.",
  },
  {
    title: "Built for the Gulf Coast",
    body: "Heat, sand, salt air, and storm season are what we work in every day. We choose plants and methods that actually hold up to Mississippi weather.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        idPrefix="ab"
        eyebrow="About us"
        title={
          <>
            Two brothers,
            <br />
            one honest crew
          </>
        }
        lede="Songy Brothers is a family-owned lawn care and landscaping company serving communities up and down the Mississippi Gulf Coast."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <p className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.5]">
              <span className="font-display float-left text-[4.4em] leading-[0.8] pr-3 pt-1 text-brass-deep" aria-hidden="true">
                W
              </span>
              e started Songy Brothers on a simple idea: give people the best
              price and the highest quality of work, and treat every yard like
              it&apos;s our own. It&apos;s a family business, owned and
              operated, and that&apos;s exactly how we run it — you deal with us
              directly, and we stand behind everything we do.
            </p>
            <p className="mt-8 leading-relaxed text-ink/75">
              Today we take care of lawns and landscapes across the Mississippi
              Gulf Coast — Bay St. Louis, Diamondhead, Pass Christian, Long
              Beach, Gulfport, Biloxi, D&apos;Iberville, and Ocean Springs. From
              a standing weekly mow to a full landscape install, sod, tree work,
              or a seasonal cleanup, it&apos;s the same crew, the same standard,
              and always a free estimate up front.
            </p>
          </Reveal>

          <Reveal className="mt-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-ink/20">
              {site.proofPoints.map(([n, label], i) => (
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
            <SectionHeading center eyebrow="How we work" title="What you can count on" />
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
              Serving the Mississippi Gulf Coast
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              Let&apos;s take care of your yard
            </h2>
            <div className="mt-9">
              <ButtonLink href="/contact">Get a Free Estimate</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
