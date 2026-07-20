import type { Metadata } from "next";
import PageHero from "@/components/roofing/PageHero";
import Reveal from "@/components/roofing/Reveal";
import { Button, SectionHeading } from "@/components/roofing/ui";
import { site } from "@/lib/roofing-site";
import { IconCheck, IconShield, IconWrench, IconStar } from "@/components/roofing/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Coast to Coast Roofing is a locally owned, BBB-accredited roofing company serving the Mississippi Gulf Coast since 2023.",
};

const values = [
  { icon: IconStar, title: "Quality work", body: "We do the job right the first time, with materials and workmanship we stand behind — that's how our name gets passed to the next neighbor." },
  { icon: IconWrench, title: "Competitive prices", body: "Fair, honest pricing with no surprise add-ons. You get a clear estimate up front and that's what you pay." },
  { icon: IconShield, title: "Respect for your home", body: "We protect your property, clean up every day, and sweep for nails before we leave. Customers tell us we clean up better than expected." },
  { icon: IconCheck, title: "Local & accountable", body: "We live and work on this coast. When you call, you reach the people actually doing the work — not a national call center." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero idPrefix="ab" eyebrow="About us" title={<>We are Coast<br />to Coast.</>} lede="A locally owned, BBB-accredited roofing company — built on quality work, fair prices, and treating your home like our own." />

      <section className="bg-bone">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <p className="font-display text-[clamp(1.3rem,2.4vw,1.7rem)] leading-[1.45] tracking-[-0.01em] text-slate">
              We started Coast to Coast with one idea: give the Gulf Coast a
              roofer it can actually trust. One that shows up, does the work
              right, charges a fair price — and leaves the property cleaner than
              we found it.
            </p>
            <p className="mt-6 text-ink/75 leading-relaxed">
              We&apos;re a locally owned and operated business, BBB accredited,
              serving Biloxi, Gulfport, Ocean Springs, D&apos;Iberville and the
              surrounding communities since 2023. Whether it&apos;s a small leak,
              a full replacement, or storm damage that needs to go through
              insurance, we handle it start to finish — and we back it with real,
              5-star reviews from your neighbors.
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate/15 bg-white">
              {site.proofPoints.map(([n, label], i) => (
                <div key={label} className={`p-6 text-center border-slate/15 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 || i === 2 ? "lg:border-r" : ""}`}>
                  <p className="font-display font-bold text-4xl text-amber-deep">{n}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-ink/60 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <Reveal><SectionHeading center eyebrow="How we work" title="What you can count on" /></Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 90}>
                <div className="bg-white border border-slate/10 p-8 h-full">
                  <div className="w-12 h-12 flex items-center justify-center bg-slate text-amber"><v.icon className="w-6 h-6" /></div>
                  <h3 className="mt-5 font-display uppercase text-xl font-semibold text-slate">{v.title}</h3>
                  <p className="mt-3 text-sm text-ink/70 leading-relaxed">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24 text-center">
          <Reveal>
            <p className="font-display uppercase text-xs tracking-cap text-amber">BBB Accredited · Locally owned</p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.02em]">Let&apos;s get your roof taken care of.</h2>
            <div className="mt-8"><Button href="/roofing/contact">Get a Free Inspection</Button></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
