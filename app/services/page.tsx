import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import {
  IconCompassRose,
  IconDrop,
  IconLantern,
  IconOak,
  IconTopiary,
  IconTrowel,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Landscape design & build, native coastal planting, estate grounds care, garden lighting, irrigation and drainage in Biloxi, Mississippi.",
};

const services = [
  {
    icon: IconCompassRose,
    n: "I",
    title: "Landscape Design & Build",
    body: "Every commission begins with a measured plan of your grounds — sight lines, soils, drainage, and the trees that must be honored. We draw the master plan, then our own crews grade, set stone, and plant it. One studio, from first sketch to final sweep.",
    details: ["Master planning & 3D studies", "Hardscape: stone, brick, shell", "Grading & site preparation", "Permit drawings"],
  },
  {
    icon: IconOak,
    n: "II",
    title: "Native & Coastal Planting",
    body: "The Gulf Coast is its own climate: salt air, sand-laced soil, hurricanes, and heat. We plant what belongs — live oak, sweetbay magnolia, yaupon, muhly grass, sea oats — arranged with the discipline of a formal garden and the ease of the coast.",
    details: ["Salt & wind tolerant palettes", "Pollinator & rain gardens", "Heritage tree preservation", "Seasonal color programs"],
  },
  {
    icon: IconTopiary,
    n: "III",
    title: "Estate Grounds Care",
    body: "Fine gardens are kept, not just cut. Our grounds teams return weekly with a horticulturist's eye: pruning by hand, feeding by soil test, edging to a line. The measure of our care is that guests assume you have a gardener living on the property.",
    details: ["Weekly estate maintenance", "Hand pruning & topiary", "Turf programs", "Storm preparation & recovery"],
  },
  {
    icon: IconLantern,
    n: "IV",
    title: "Garden Lighting",
    body: "Evenings are the Gulf Coast's finest hour. We design lighting that follows the architecture of the garden — moonlight cast down through oak canopies, lanterns pacing a path, a soft wash on old brick — never glare, never runway lights.",
    details: ["Canopy moonlighting", "Path & step lanterns", "Façade & specimen lighting", "Full low-voltage systems"],
  },
  {
    icon: IconDrop,
    n: "V",
    title: "Irrigation & Drainage",
    body: "Twelve inches of rain can fall here in an afternoon. We engineer grounds that drink what they need and shed the rest — quiet drip zones under the beds, French drains beneath the lawn, rain gardens where the water wants to gather.",
    details: ["Smart irrigation systems", "French drains & dry creeks", "Rain gardens", "Erosion control"],
  },
  {
    icon: IconTrowel,
    n: "VI",
    title: "Outdoor Living",
    body: "Porches, courtyards, summer kitchens, fire circles: the rooms without ceilings. We build them in materials that age like the town — tumbled brick, oyster-shell tabby, cypress, and stone — so new work looks settled from the first evening.",
    details: ["Courtyards & terraces", "Summer kitchens & fire features", "Pergolas & arbors", "Fountains & water features"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        idPrefix="svc"
        eyebrow="Services"
        title={
          <>
            The disciplines
            <br />
            of the grounds
          </>
        }
        lede="Six practices, one studio. Engage us for a single commission or place the whole of your grounds in our keeping."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="space-y-0">
            {services.map((s, i) => (
              <Reveal key={s.title}>
                <article
                  className={`grid gap-8 lg:grid-cols-[110px_1fr_280px] py-14 ${
                    i > 0 ? "border-t border-ink/15" : ""
                  }`}
                >
                  <div className="flex lg:flex-col items-center lg:items-start gap-5">
                    <s.icon className="w-10 h-10 text-brass-deep" />
                    <span className="font-display text-2xl text-ink/40">{s.n}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                      {s.title}
                    </h2>
                    <p className="mt-5 max-w-2xl leading-relaxed text-ink/75">
                      {s.body}
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-ink/70 lg:pt-2">
                    {s.details.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span className="mt-[0.65em] block w-4 border-t border-brass-deep shrink-0" aria-hidden="true" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-parchment text-ink">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 py-20 sm:py-28 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-cap text-brass-deep">
              Engagements from $15k · grounds care from $650/mo
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              Every commission begins with a walk of the grounds
            </h2>
            <div className="mt-9">
              <ButtonLink href="/contact">Schedule the Walk</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
