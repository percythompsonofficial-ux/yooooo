import Link from "next/link";
import HeroBg from "@/components/HeroBg";
import Reveal from "@/components/Reveal";
import ProjectImage from "@/components/ProjectImage";
import { Button, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import {
  IconRoof,
  IconLeak,
  IconStorm,
  IconClipboardCheck,
  IconHome,
  IconBuilding,
  IconStar,
  IconPhone,
  IconArrow,
  IconCheck,
} from "@/components/icons";

const services = [
  { icon: IconRoof, title: "Roof Replacement", body: "Full tear-off and new roof systems built to stand up to Gulf Coast sun and storms." },
  { icon: IconLeak, title: "Roof Repair & Leaks", body: "Fast, lasting repairs — from a single leak to missing shingles after a blow." },
  { icon: IconStorm, title: "Storm & Insurance Claims", body: "Wind and hail damage documented and handled with your insurance, start to finish." },
  { icon: IconClipboardCheck, title: "Free Roof Inspections", body: "An honest, no-pressure look at your roof with clear photos and a plain estimate." },
  { icon: IconHome, title: "Residential Roofing", body: "Homes across the coast — shingle and metal, done clean and cleaned up after." },
  { icon: IconBuilding, title: "Commercial Roofing", body: "Flat and low-slope systems for local businesses, on schedule and on budget." },
];

const projects = [
  { photo: "/photos/project-1.jpg", fallback: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=72", alt: "Completed shingle roof replacement on a coastal home", title: "Shingle Replacement", place: "Biloxi" },
  { photo: "/photos/project-2.jpg", fallback: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=72", alt: "New roof on a Gulfport home after storm damage", title: "Storm Restoration", place: "Gulfport" },
  { photo: "/photos/project-3.jpg", fallback: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=72", alt: "Metal roof installation on an Ocean Springs property", title: "Metal Roof", place: "Ocean Springs" },
];

export default function Home() {
  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative bg-slate text-white overflow-hidden">
        <HeroBg
          src="/photos/hero.jpg"
          fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1900&q=72"
          idPrefix="hero"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-14 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl animate-fade-up">
            <p className="font-display uppercase text-sm tracking-cap text-amber">
              We are Coast to Coast Roofing
            </p>
            <h1 className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.02em] text-[clamp(2.8rem,7.5vw,5.8rem)]">
              Next-level roofing
              <br />
              for the <span className="text-amber">Gulf Coast.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-fog/90 leading-relaxed">
              Locally owned and built for the coast — quality craftsmanship at a
              fair price, with free inspections and honest estimates.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Button href="/contact">Get a Free Inspection</Button>
              <Button href={site.contact.phoneHref} variant="outline" external>
                <IconPhone className="w-5 h-5" /> {site.contact.phoneDisplay}
              </Button>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {site.badges.map((b) => (
              <span key={b} className="flex items-center gap-2 text-sm text-fog">
                <IconCheck className="w-5 h-5 text-amber" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Services ——— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <SectionHeading eyebrow="What we do" title={<>Roofing services<br />for the whole coast</>} />
              <Button href="/services" variant="ghost" className="shrink-0">All Services <IconArrow className="w-4 h-4" /></Button>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 80}>
                <Link href="/services" className="group block h-full bg-white border border-slate/10 p-8 hover:border-amber transition-colors duration-300">
                  <div className="w-12 h-12 flex items-center justify-center bg-slate text-amber group-hover:bg-amber group-hover:text-slate transition-colors duration-300">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-6 font-display uppercase text-xl font-semibold text-slate">{s.title}</h3>
                  <p className="mt-3 text-sm text-ink/70 leading-relaxed">{s.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Storm / insurance band ——— */}
      <section className="relative bg-slate text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <SectionHeading dark eyebrow="Storm season on the coast" title={<>Hail or wind damage?<br />We handle the claim.</>} />
              <p className="mt-6 text-fog/85 leading-relaxed max-w-lg">
                Living on the Gulf Coast means your roof takes a beating. We
                inspect for storm damage, document everything your insurance
                needs, and work directly with your adjuster — so you get the
                roof you&apos;re owed without the runaround.
              </p>
              <ul className="mt-7 space-y-3">
                {["Free storm-damage inspection", "Full photo documentation for your claim", "We meet your adjuster on-site", "Repairs and full replacements"].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-fog">
                    <IconCheck className="w-5 h-5 text-amber shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button href="/contact">Start My Free Inspection</Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-3 gap-4">
              {site.proofPoints.map(([n, label]) => (
                <div key={label} className="bg-slate-2 border border-white/10 p-5 text-center">
                  <p className="font-display font-bold text-3xl text-amber">{n}</p>
                  <p className="mt-2 text-xs text-steel leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— Projects ——— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal><SectionHeading center eyebrow="Recent work" title="Roofs across the Gulf Coast" /></Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <Link href="/projects" className="group block">
                  <ProjectImage src={p.photo} fallbackSrc={p.fallback} alt={p.alt} idPrefix={`h${i}`} className="w-full aspect-[4/3]" />
                  <div className="mt-4 flex items-baseline justify-between">
                    <h3 className="font-display uppercase text-lg font-semibold text-slate group-hover:text-amber-deep transition-colors">{p.title}</h3>
                    <span className="text-xs uppercase tracking-[0.14em] text-ink/50">{p.place}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Reviews ——— */}
      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal><SectionHeading center eyebrow="What neighbors say" title="Trusted on the coast" /></Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {site.reviews.map((r, i) => (
              <Reveal key={i} delay={i * 90}>
                <figure className="h-full bg-white border border-slate/10 p-8 flex flex-col">
                  <div className="flex gap-1 text-amber" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, k) => <IconStar key={k} className="w-5 h-5" />)}
                  </div>
                  <blockquote className="mt-5 flex-1 font-display text-xl text-slate leading-snug">“{r.quote}”</blockquote>
                  <figcaption className="mt-5 text-xs uppercase tracking-[0.14em] text-ink/50">{r.who}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
