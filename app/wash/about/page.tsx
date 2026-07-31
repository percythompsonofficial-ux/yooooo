import type { Metadata } from "next";
import PageHero from "@/components/wash/PageHero";
import Reveal from "@/components/wash/Reveal";
import SurfacePlate from "@/components/wash/SurfacePlate";
import { Button, SectionHeading, Eyebrow, FanRule } from "@/components/wash/ui";
import { site, process } from "@/lib/wash-site";
import { IconArrow, IconCheck, IconMapPin } from "@/components/wash/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Saltline Surface Co. is a Gulf Coast exterior cleaning company that runs hot water, soft-wash chemistry and the correct pressure for every material. Licensed, insured and locally owned.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We're the ones who turn the pressure down."
        lede="Anyone can rent a machine and take the film off a driveway. The part that takes knowing is the roof that needs no pressure at all, the mortar that's softer than the brick, and the deck that will never take stain again if you get too close."
      />

      {/* ——— The story ——— */}
      <section className="bg-chalk">
        <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow={`On the coast since ${site.since}`}
              title="Salt air is the reason this job exists here."
            />
            <div className="mt-8 space-y-6 text-[1.0625rem] leading-relaxed text-prussian/85">
              <p>
                Humidity, salt carried in off the Sound, and eight months of
                heat make the Gulf Coast about the most hospitable place in the
                country for the things that grow on your house. A driveway
                inland might go a decade before anyone notices. Here it&rsquo;s
                two or three years, and the north side of a roof starts
                streaking sooner than that.
              </p>
              <p>
                Saltline started because too many houses on this coast were
                being cleaned by someone with a rented machine, one tip, and no
                idea that shingles and concrete are not the same problem. The
                damage from that doesn&rsquo;t show up the day of the job. It
                shows up the following spring, when water that got behind the
                siding finally comes through the drywall.
              </p>
              <p>
                So we run hot water, we run soft-wash chemistry, and we test
                every surface before we start. If a wash won&rsquo;t fix
                what&rsquo;s bothering you, we&rsquo;d rather tell you that on
                the quote than take the money and leave you disappointed.
              </p>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-9 gap-y-4">
              {site.badges.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2.5 text-[0.9375rem] text-prussian/80"
                >
                  <IconCheck className="h-5 w-5 text-spray" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <SurfacePlate
              kind="siding"
              caption="North-facing lap siding, three seasons in"
              note="Low pressure, high volume, and detergent that kills the growth rather than pushing it around."
            />
          </Reveal>
        </div>
      </section>

      {/* ——— Standards ——— */}
      <section className="bg-prussian text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="What you can hold us to"
              title="Four things we don't negotiate on."
            />
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg bg-chalk/15 md:grid-cols-2">
            {[
              {
                title: "The quote is the price",
                body: "The number we write down is the number you pay. If the job turns out bigger than the photos suggested, that's our estimate to have gotten right.",
              },
              {
                title: "Your plants get protected",
                body: "Beds are soaked before anything is applied and flushed afterward. Runoff is directed away from the pool, the storm drain and the neighbour's yard.",
              },
              {
                title: "We say when it won't work",
                body: "Permanent staining, failing mortar, granule loss already done — you hear about it during the walkthrough, not after you've paid.",
              },
              {
                title: "You approve before we load up",
                body: "We walk the finished surface with you. Another pass is another pass, not a change order.",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <article className="h-full bg-prussian p-8 sm:p-10">
                  <FanRule className="text-spray-lit" />
                  <h3 className="mt-6 font-display text-[1.35rem] font-semibold tracking-[-0.025em] text-chalk">
                    {s.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-efflor">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Process ——— */}
      <section className="border-b border-prussian/10 bg-chalk-2">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="How a job runs"
              title="Five stages, in this order, every time."
            />
          </Reveal>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-lg bg-prussian/10 md:grid-cols-5">
            {process.map((step, i) => (
              <Reveal key={step.stage} delay={i * 70}>
                <li className="h-full bg-chalk-2 p-7">
                  <p className="spec text-spray-ink tabular-nums">
                    Stage {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-prussian">
                    {step.stage}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                    {step.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Service area ——— */}
      <section className="bg-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Where we work"
              title="From Bay St. Louis to Pascagoula."
              lede="If you're just outside the list, call anyway — we're often on that side of the coast already."
            />
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-12 flex flex-wrap gap-3">
              {site.serviceArea.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-full border border-prussian/15 bg-chalk-2 px-5 py-2.5 text-[0.9375rem] text-prussian/85"
                >
                  <IconMapPin className="h-4 w-4 text-spray" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-prussian text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <Eyebrow dark>Free written quote</Eyebrow>
                <p className="mt-4 max-w-[26ch] font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
                  Let&rsquo;s see what&rsquo;s under there.
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
