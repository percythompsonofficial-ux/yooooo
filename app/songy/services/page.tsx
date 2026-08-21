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
    "Lawn maintenance, landscape design and installation, sod and resodding, shrub and flower bed care, tree trimming and removal, and fertilization across the Mississippi Gulf Coast.",
};

const services = [
  {
    icon: IconTrowel,
    n: "I",
    title: "Lawn Maintenance & Mowing",
    body: "The backbone of a sharp yard: dependable mowing on a schedule that fits your grass, with clean edging, string trimming, and a full blow-off every visit. Same crew each time, so nothing gets missed and your lawn keeps an even, cared-for cut all season.",
    details: ["Weekly & biweekly mowing", "Edging & string trimming", "Blowing & cleanup", "Spring & fall cleanups"],
  },
  {
    icon: IconCompassRose,
    n: "II",
    title: "Landscape Design & Installation",
    body: "From a single new bed to a whole-yard makeover. We plan and install plantings, borders, and beds suited to the Gulf Coast — plants that handle the heat, sand, and salt air, laid out to look good the day we finish and better every year after.",
    details: ["New beds & borders", "Plant & shrub installation", "Mulch & ground cover", "Full yard makeovers"],
  },
  {
    icon: IconDrop,
    n: "III",
    title: "Sod & Resodding",
    body: "When a lawn is too far gone to save, we start fresh. We remove the old turf, prepare and grade the soil so it drains, and lay healthy new sod for an instant, even lawn. Done right so it roots in and lasts, not just looks good for a week.",
    details: ["Old turf removal", "Soil prep & grading", "Fresh sod installation", "New-lawn guidance"],
  },
  {
    icon: IconTopiary,
    n: "IV",
    title: "Shrubs, Hedges & Flower Beds",
    body: "Beds and shrubs are what make a yard look finished. We prune and shape hedges, refresh mulch, pull weeds, remove tired shrubs and replace them, and plant seasonal color — the details that keep the whole property looking intentional.",
    details: ["Shrub & hedge pruning", "Shrub removal & replacement", "Bed weeding & mulching", "Seasonal flowers & color"],
  },
  {
    icon: IconOak,
    n: "V",
    title: "Tree Trimming & Removal",
    body: "Gulf Coast trees need attention — especially before storm season. We trim for health and clearance, clean up limbs and debris after weather, and handle safe removals of trees that have to come down, leaving the site clean.",
    details: ["Trimming & shaping", "Limb & storm cleanup", "Safe tree removal", "Debris haul-off"],
  },
  {
    icon: IconLantern,
    n: "VI",
    title: "Fertilization & Weed Control",
    body: "A thick, green lawn starts under the surface. We put your grass on a feeding and weed-control program suited to Gulf Coast turf, so it comes in fuller, crowds out weeds, and holds its color through the long Mississippi growing season.",
    details: ["Seasonal fertilization", "Weed control", "Turf health programs", "Problem-lawn recovery"],
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
            Everything your yard
            <br />
            needs, one crew
          </>
        }
        lede="Call us for a one-time job or put your lawn on a regular schedule. Every service comes with a free estimate and honest pricing."
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
              Free estimates · family owned &amp; operated
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              Tell us what your yard needs
            </h2>
            <div className="mt-9">
              <ButtonLink href="/songy/contact">Get a Free Estimate</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
