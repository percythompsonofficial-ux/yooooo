import type { Metadata } from "next";
import PageHero from "@/components/wash/PageHero";
import SurfacePlate, { type SurfaceKind } from "@/components/wash/SurfacePlate";
import Reveal from "@/components/wash/Reveal";
import { Button, SectionHeading, Eyebrow } from "@/components/wash/ui";
import { IconArrow } from "@/components/wash/icons";

export const metadata: Metadata = {
  title: "Surfaces",
  description:
    "Material samples showing what comes off concrete, brick, cedar, shingle, siding and pavers — and what each surface can safely take.",
};

const samples: {
  kind: SurfaceKind;
  caption: string;
  note: string;
  comes: string;
  stays: string;
}[] = [
  {
    kind: "concrete",
    caption: "Broom-finished concrete",
    note: "Driveways, walkways, patios and garage aprons.",
    comes:
      "Algae film, mildew, tyre rubber, mud, pollen, most oil with hot water",
    stays:
      "Deep rust, old paint overspray, and staining that has soaked into the pour",
  },
  {
    kind: "brick",
    caption: "Brick in running bond",
    note: "Façades, garden walls, chimneys and steps.",
    comes: "Organic growth, salt efflorescence, soot, general grime",
    stays: "Failed mortar, spalled brick faces, and old paint on soft brick",
  },
  {
    kind: "deck",
    caption: "Cedar decking",
    note: "Decks, docks, pergolas and privacy fencing.",
    comes: "Grey oxidation, mildew, algae, spent sealer that has begun to fail",
    stays: "Deep tannin bleed, ingrained iron stains, and existing furring",
  },
  {
    kind: "roof",
    caption: "Asphalt shingle",
    note: "Roofs with the black streaking that shows on the north face first.",
    comes: "Gloeocapsa magma algae, lichen, moss, the black streaking itself",
    stays: "Granule loss already done, and lichen scarring on very old shingle",
  },
  {
    kind: "siding",
    caption: "Lap siding",
    note: "Vinyl, Hardie board, stucco and painted wood.",
    comes: "Green and black growth, spider webbing, dirt line under the eaves",
    stays: "Chalked or failing paint, and fading from years of direct sun",
  },
  {
    kind: "pavers",
    caption: "Clay pavers",
    note: "Patios, pool surrounds, driveways and walkways.",
    comes: "Weeds in the joints, moss, efflorescence, general soiling",
    stays:
      "Settling and sunken pavers, which is a base problem, not a dirt problem",
  },
];

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Surfaces"
        title="What comes off, and what honestly doesn't."
        lede="Most of what people call permanent staining isn't. Some of it genuinely is, and you should hear that before you pay for a wash that won't fix it. Tap any sample to put the film back on."
      />

      <section className="bg-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2">
            {samples.map((s, i) => (
              <Reveal key={s.kind} delay={(i % 2) * 90}>
                <article>
                  <SurfacePlate kind={s.kind} delay={i * 120} />
                  <h2 className="mt-6 font-display text-[1.45rem] font-semibold tracking-[-0.025em] text-prussian">
                    {s.caption}
                  </h2>
                  <p className="mt-1.5 text-[0.9375rem] text-stone">{s.note}</p>

                  <dl className="mt-6 space-y-4 border-t border-prussian/12 pt-6">
                    <div>
                      <dt className="spec text-spray-ink">Comes off</dt>
                      <dd className="mt-2 text-[0.9375rem] leading-relaxed text-prussian/85">
                        {s.comes}
                      </dd>
                    </div>
                    <div>
                      <dt className="spec text-stone/70">Stays</dt>
                      <dd className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
                        {s.stays}
                      </dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-prussian/10 bg-chalk-2">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="A note on photographs"
              title="These samples are drawn, not photographed."
              lede="Every pressure washing site on the coast runs the same borrowed stock driveways. We'd rather show you the materials honestly and let the work speak when we're standing in your yard. Ask and we'll send real before-and-afters from jobs near you."
            />
            <div className="mt-10">
              <Button href="/wash/contact" variant="quiet">
                Ask for photos near you{" "}
                <IconArrow className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-prussian text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <Eyebrow dark>Free written quote</Eyebrow>
                <p className="mt-4 max-w-[24ch] font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
                  Find out what&rsquo;s under yours.
                </p>
              </div>
              <Button href="/wash/contact">
                Get a free quote <IconArrow className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
