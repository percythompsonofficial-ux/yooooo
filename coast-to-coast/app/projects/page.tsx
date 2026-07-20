import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectImage from "@/components/ProjectImage";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Recent roofing projects across Biloxi, Gulfport, Ocean Springs and the Mississippi Gulf Coast — replacements, storm restorations, repairs, and metal roofs.",
};

const projects = [
  { photo: "/photos/project-1.jpg", fallback: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=72", alt: "Shingle roof replacement on a coastal home", title: "Shingle Replacement", place: "Biloxi", type: "Roof Replacement" },
  { photo: "/photos/project-2.jpg", fallback: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=72", alt: "Full roof restoration after storm damage", title: "Storm Restoration", place: "Gulfport", type: "Insurance Claim" },
  { photo: "/photos/project-3.jpg", fallback: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=72", alt: "Standing-seam metal roof installation", title: "Metal Roof Install", place: "Ocean Springs", type: "Metal Roofing" },
  { photo: "/photos/project-4.jpg", fallback: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=72", alt: "New roof on a family home", title: "Full Re-Roof", place: "D'Iberville", type: "Roof Replacement" },
  { photo: "/photos/project-5.jpg", fallback: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=72", alt: "Repaired roofline and flashing", title: "Leak & Flashing Repair", place: "Long Beach", type: "Roof Repair" },
  { photo: "/photos/project-6.jpg", fallback: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1400&q=72", alt: "Commercial low-slope roof project", title: "Commercial Roof", place: "Pascagoula", type: "Commercial" },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHero idPrefix="pj" eyebrow="Our work" title={<>Roofs we&apos;re<br />proud of</>} lede="A look at recent projects across the coast. See more on our Facebook page — new jobs go up all the time." />

      <section className="bg-bone">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 90}>
                <article className="group">
                  <div className="relative">
                    <ProjectImage src={p.photo} fallbackSrc={p.fallback} alt={p.alt} idPrefix={`p${i}`} className="w-full aspect-[4/3]" />
                    <span className="absolute top-0 left-0 bg-amber text-white font-display uppercase text-[0.65rem] tracking-[0.14em] px-3 py-1.5">{p.type}</span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <h2 className="font-display uppercase text-lg font-semibold text-slate">{p.title}</h2>
                    <span className="text-xs uppercase tracking-[0.14em] text-ink/50">{p.place}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 text-center">
            <p className="text-sm text-ink/60">
              More recent jobs on{" "}
              <a href={site.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-amber-deep underline underline-offset-4 hover:text-slate transition-colors">our Facebook page</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="font-display uppercase text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight">Want your roof on this page next?</h2>
            <div className="mt-8"><Button href="/contact">Get a Free Inspection</Button></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
