import type { Metadata } from "next";
import PageHero from "@/components/wash/PageHero";
import Reveal from "@/components/wash/Reveal";
import { Button, TipSpec, Eyebrow } from "@/components/wash/ui";
import { services, tipMeta, type TipCode } from "@/lib/wash-site";
import { surfaceIcons, IconArrow, IconCheck } from "@/components/wash/icons";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Driveways, house soft wash, roof soft wash, brick and masonry, decks and fencing, pavers and pool decks — the method, nozzle tip and working pressure for each surface.",
};

const tipOrder: TipCode[] = ["red", "yellow", "green", "white", "soap"];
const tipUse: Record<TipCode, string> = {
  red: "Pencil-thin and violent. Concrete cutting only — it will scar almost anything else.",
  yellow: "Tight fan for hard masonry and heavy build-up on durable stone.",
  green: "The workhorse. Most flatwork, pavers and hard surfaces run here.",
  white: "Wide and gentle. Siding, wood and anything with a finish to protect.",
  soap: "No cutting force at all. Carries detergent onto roofs and painted surfaces.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Six surfaces. Six different amounts of force."
        lede="A pressure washer is one machine that behaves like five different tools depending on what you screw onto the end. Here is exactly what goes on the wand for each surface, and why."
      />

      {/* ——— The tip code, explained once ——— */}
      <section className="border-b border-prussian/10 bg-chalk-2">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <Eyebrow>The nozzle code</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-prussian text-balance">
              Every tip in the trade is colour-coded by spray angle. Wider
              angle, less force.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg bg-prussian/10 sm:grid-cols-2 lg:grid-cols-5">
            {tipOrder.map((tip, i) => (
              <Reveal key={tip} delay={i * 60}>
                <li className="h-full bg-chalk-2 p-6">
                  <span
                    className={`block h-3 w-3 rounded-full ${
                      tip === "soap" ? "ring-1 ring-prussian/40" : ""
                    }`}
                    style={{ background: tipMeta[tip].color }}
                    aria-hidden="true"
                  />
                  <p className="spec mt-4 text-prussian">
                    {tipMeta[tip].label}
                  </p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                    {tipUse[tip]}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={140}>
            <p className="mt-10 max-w-[62ch] text-[1.0625rem] leading-relaxed text-stone">
              We do own a red tip. It lives in the trailer and comes out for
              stripping paint off concrete, which is roughly once a year.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— Each service in full ——— */}
      <section className="bg-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="divide-y divide-prussian/12">
            {services.map((s, i) => {
              const Icon = surfaceIcons[s.slug as keyof typeof surfaceIcons];
              return (
                <Reveal key={s.slug} delay={i * 50}>
                  <article
                    id={s.slug}
                    className="grid gap-8 py-14 first:pt-0 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"
                  >
                    <div>
                      <Icon className="h-8 w-8 text-spray" />
                      <h2 className="mt-6 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-prussian">
                        {s.title}
                      </h2>
                      <p className="spec mt-3 text-stone/70">{s.surface}</p>
                      <TipSpec tip={s.tip} spec={s.spec} className="mt-6" />
                    </div>

                    <div>
                      <p className="max-w-[58ch] text-[1.0625rem] leading-relaxed text-prussian/85">
                        {s.body}
                      </p>
                      <ul className="mt-7 space-y-3.5">
                        {s.detail.map((d) => (
                          <li key={d} className="flex gap-3.5">
                            <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-spray" />
                            <span className="text-[0.9375rem] leading-relaxed text-stone">
                              {d}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="bg-prussian text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <Eyebrow dark>Not sure which one you need</Eyebrow>
                <p className="mt-4 max-w-[26ch] font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
                  Send a photo. We&rsquo;ll tell you what it is.
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
