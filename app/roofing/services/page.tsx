import type { Metadata } from "next";
import PageHero from "@/components/roofing/PageHero";
import Reveal from "@/components/roofing/Reveal";
import { Button } from "@/components/roofing/ui";
import {
  IconRoof, IconLeak, IconStorm, IconClipboardCheck, IconHome, IconBuilding, IconCheck,
} from "@/components/roofing/icons";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Roof replacement, roof repair and leaks, storm & insurance claims, free inspections, and residential & commercial roofing across the Mississippi Gulf Coast.",
};

const services = [
  { icon: IconRoof, n: "01", title: "Roof Replacement", body: "When a roof is past repair, we replace it right — full tear-off, a clean deck, quality shingle or metal systems, and a crew that treats your property like their own. Built for Gulf Coast heat, humidity, and hurricane-season wind.", points: ["Shingle & metal systems", "Full tear-off & deck check", "Manufacturer-grade materials", "Clean job site, every day"] },
  { icon: IconLeak, n: "02", title: "Roof Repair & Leaks", body: "A small leak turns into a big problem fast on the coast. We find the real source — not just the stain — and fix it to last: flashing, boots, valleys, missing or lifted shingles, and storm gaps.", points: ["Leak detection & repair", "Flashing & valley work", "Shingle replacement", "Emergency tarping"] },
  { icon: IconStorm, n: "03", title: "Storm & Insurance Claims", body: "Wind and hail damage is our specialty down here. We inspect thoroughly, document everything with photos, and work directly with your insurance adjuster so your claim is fair and your roof gets restored properly.", points: ["Free storm-damage inspection", "Full claim documentation", "We meet your adjuster", "Repairs & full replacements"] },
  { icon: IconClipboardCheck, n: "04", title: "Free Roof Inspections", body: "No pressure, no gimmicks. We climb up, take photos, and give you a straight answer on the condition of your roof and what — if anything — it needs, with a clear written estimate.", points: ["Top-to-bottom inspection", "Photo report", "Honest recommendation", "Written estimate"] },
  { icon: IconHome, n: "05", title: "Residential Roofing", body: "From beach cottages to family homes across the coast, we handle residential roofs of every pitch and style, and we clean up so well you'd never know we were there — except for the new roof.", points: ["Shingle & metal roofs", "Re-roofs & new construction", "Ridge vents & ventilation", "Full cleanup & nail sweep"] },
  { icon: IconBuilding, n: "06", title: "Commercial Roofing", body: "Local businesses trust us with flat and low-slope roofs — done on schedule, on budget, and with minimal disruption to your operation.", points: ["Flat & low-slope systems", "Coatings & restoration", "Repairs & maintenance", "Scheduled around your business"] },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero idPrefix="svc" eyebrow="What we do" title={<>Every roof,<br />done properly.</>} lede="From a quick repair to a full replacement or a storm claim — one local crew, one standard, and always a free inspection first." />

      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28 space-y-6">
          {services.map((s) => (
            <Reveal key={s.title}>
              <article className="bg-white border border-slate/10 p-8 sm:p-10 grid gap-8 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate text-amber shrink-0"><s.icon className="w-6 h-6" /></div>
                    <span className="font-display text-2xl text-slate/30 font-bold">{s.n}</span>
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-slate">{s.title}</h2>
                  <p className="mt-4 text-ink/75 leading-relaxed max-w-2xl">{s.body}</p>
                </div>
                <ul className="space-y-3 lg:border-l lg:border-slate/10 lg:pl-8">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm text-ink/75">
                      <IconCheck className="w-5 h-5 text-amber shrink-0" /> {pt}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-slate text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.02em]">Not sure what you need? We&apos;ll take a look — free.</h2>
            <div className="mt-8"><Button href="/roofing/contact">Get a Free Inspection</Button></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
