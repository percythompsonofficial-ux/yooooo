import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectImage from "@/components/ProjectImage";
import { type SceneVariant } from "@/components/ProjectScene";
import Reveal from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Lawn care and landscaping across Biloxi, Gulfport, Ocean Springs, and the Mississippi Gulf Coast — mowing, sod, landscape installs, tree work, and more.",
};

const work: {
  variant: SceneVariant;
  photo: string;
  photoAlt: string;
  title: string;
  summary: string;
  scope: string[];
}[] = [
  {
    variant: "cottage",
    photo:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Freshly planted and mulched landscape beds along a home",
    title: "Landscape Installations",
    summary:
      "Full-yard makeovers and new beds — plants chosen for the Coast, laid out to look finished the day we leave.",
    scope: ["Design", "Planting", "Mulch & edging"],
  },
  {
    variant: "coastal",
    photo:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "A neatly mowed and edged green lawn beside a home",
    title: "Lawn Maintenance",
    summary:
      "Regular mowing, edging, and cleanup that keeps a property looking cared-for week after week.",
    scope: ["Mowing", "Edging", "Cleanup"],
  },
  {
    variant: "parterre",
    photo:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "A lush, freshly sodded green lawn in front of a home",
    title: "Sod & Resodding",
    summary:
      "Worn-out lawns pulled, graded, and replaced with fresh sod for an instant, even, healthy lawn.",
    scope: ["Turf removal", "Grading", "New sod"],
  },
  {
    variant: "cottage",
    photo:
      "https://images.unsplash.com/photo-1444392061186-9fc38f84f726?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "A planted flower bed with seasonal color",
    title: "Flower Beds & Seasonal Color",
    summary:
      "Refreshed beds, new mulch, and seasonal flowers — the details that make a whole yard look intentional.",
    scope: ["Beds", "Mulch", "Seasonal color"],
  },
  {
    variant: "poolside",
    photo:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Trimmed shrubs and hedges framing a tidy landscape",
    title: "Shrub & Hedge Care",
    summary:
      "Pruning and shaping that keeps hedges crisp and shrubs healthy — plus removals and replacements when needed.",
    scope: ["Pruning", "Shaping", "Replacement"],
  },
  {
    variant: "allee",
    photo:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=70",
    photoAlt: "Mature trees trimmed and cleared over a property",
    title: "Tree Trimming & Removal",
    summary:
      "Trimming for health and clearance, storm cleanup, and safe removals — with the debris hauled away clean.",
    scope: ["Trimming", "Storm cleanup", "Removal"],
  },
];

export default function OurWorkPage() {
  return (
    <>
      <PageHero
        idPrefix="pf"
        eyebrow="Our work"
        title={
          <>
            Yards we&apos;re proud
            <br />
            to put our name on
          </>
        }
        lede="A look at the kinds of work we do across the Gulf Coast. See more recent jobs on our Facebook page."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {work.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 90}>
                <article>
                  <ProjectImage
                    src={w.photo}
                    alt={w.photoAlt}
                    variant={w.variant}
                    className="w-full aspect-[4/3]"
                  />
                  <h2 className="mt-6 font-display text-2xl sm:text-3xl font-semibold">
                    {w.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-ink/75">{w.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {w.scope.map((s) => (
                      <li
                        key={s}
                        className="text-[0.68rem] uppercase tracking-[0.18em] border border-ink/25 text-ink/70 px-3 py-1.5"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20">
            <p className="text-center text-sm text-ink/60">
              Want to see more?{" "}
              <a
                href={site.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brass-deep underline underline-offset-4 hover:text-ink transition-colors"
              >
                Browse recent jobs on our Facebook page
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-fern text-ivory grain relative">
        <div className="relative z-10 mx-auto max-w-3xl px-6 sm:px-8 py-20 sm:py-28 text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.15]">
              Your yard could be next
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
