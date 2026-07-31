import Link from "next/link";
import WashHero from "@/components/wash/WashHero";
import SurfacePlate from "@/components/wash/SurfacePlate";
import Reveal from "@/components/wash/Reveal";
import QuoteForm from "@/components/wash/QuoteForm";
import {
  Button,
  SectionHeading,
  TipSpec,
  Eyebrow,
  FanRule,
} from "@/components/wash/ui";
import { site, services, process } from "@/lib/wash-site";
import {
  surfaceIcons,
  IconArrow,
  IconCheck,
  IconPhone,
  IconMapPin,
} from "@/components/wash/icons";

export default function WashHome() {
  return (
    <>
      <WashHero />

      {/* ——— The rig, in its own numbers ——— */}
      <section className="border-b border-prussian/10 bg-chalk-2">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <dl className="grid grid-cols-2 divide-prussian/10 md:grid-cols-4 md:divide-x">
            {site.rig.map(([figure, label, note], i) => (
              <div
                key={label}
                className={`py-8 md:px-8 md:py-10 ${i % 2 === 1 ? "pl-6 md:pl-8" : ""} ${
                  i < 2 ? "border-b border-prussian/10 md:border-b-0" : ""
                } ${i === 0 ? "md:pl-0" : ""}`}
              >
                <dt className="sr-only">{label}</dt>
                <dd>
                  <p className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.04em] text-prussian tabular-nums">
                    {figure}
                  </p>
                  <p className="spec mt-3 text-spray-ink">{label}</p>
                  <p className="mt-2 text-sm leading-snug text-stone">{note}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— The thesis, demonstrated on a real material ——— */}
      <section className="bg-chalk">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="What's actually on there"
              title={
                <>
                  Concrete doesn&rsquo;t fade.
                  <br />
                  It gets covered.
                </>
              }
              lede="Nothing about a slab turns gray with age. What you're looking at is a film — algae from our humidity, salt carried in off the Sound, tyre rubber, oil, and the mildew that lives on all of it. It sits on the surface. It comes off the surface."
            />
            <ul className="mt-9 space-y-4">
              {[
                "Organic growth is killed with detergent, not scraped off with pressure",
                "Hot water lifts the oil and grease that cold water only spreads",
                "Every material gets tested in a hidden spot before the job starts",
              ].map((point) => (
                <li key={point} className="flex gap-3.5">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-spray" />
                  <span className="text-[1.0625rem] leading-relaxed text-prussian/85">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href="/wash/services" variant="quiet">
                See how each surface is handled{" "}
                <IconArrow className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SurfacePlate
              kind="concrete"
              caption="Broom-finished driveway, five years uncleaned"
              note="The same slab, left and right of the wet line. Tap it to put the film back on."
            />
          </Reveal>
        </div>
      </section>

      {/* ——— Services, each carrying its real spec ——— */}
      <section className="bg-prussian text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="Six surfaces, six methods"
              title="The tip on the wand is the whole job."
              lede="Nozzle tips are colour-coded by spray angle, and the angle decides how much force lands on your property. Anyone can put a red tip on a driveway and go fast. Below is what each surface actually gets."
            />
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg bg-chalk/15 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = surfaceIcons[s.slug as keyof typeof surfaceIcons];
              return (
                <Reveal key={s.slug} delay={i * 70}>
                  <article className="group h-full bg-prussian p-8 transition-colors duration-300 hover:bg-deepwater sm:p-9">
                    <Icon className="h-7 w-7 text-spray-lit" />
                    <h3 className="mt-6 font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-chalk">
                      {s.title}
                    </h3>
                    <p className="spec mt-2 text-efflor/70">{s.surface}</p>
                    <TipSpec tip={s.tip} spec={s.spec} dark className="mt-5" />
                    <p className="mt-5 text-[0.9375rem] leading-relaxed text-efflor">
                      {s.body}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={120}>
            <div className="mt-14">
              <Button href="/wash/services" variant="outline">
                Full method for every surface{" "}
                <IconArrow className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— Material samples ——— */}
      <section className="bg-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Materials we work on"
              title="Every material has a limit. We work under it."
              lede="Tap any sample to soil it again — the wet line moves the way the water does on the real thing."
            />
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  kind: "brick",
                  caption: "Brick & mortar",
                  note: "Stepped to the softest joint on the wall, never to what the brick could take.",
                },
                {
                  kind: "deck",
                  caption: "Cedar decking",
                  note: "Washed along the grain, then brightened to bring the pH and tone back.",
                },
                {
                  kind: "roof",
                  caption: "Asphalt shingle",
                  note: "Cleaner does the work at under 100 PSI. Pressure would take the granules.",
                },
                {
                  kind: "siding",
                  caption: "Lap siding",
                  note: "Low pressure and high volume, so nothing is driven behind the laps.",
                },
                {
                  kind: "pavers",
                  caption: "Clay pavers",
                  note: "Joint sand is replaced afterward — otherwise the field starts to shift.",
                },
                {
                  kind: "concrete",
                  caption: "Concrete flatwork",
                  note: "Surface cleaner at a fixed height, so the slab lifts evenly across.",
                },
              ] as const
            ).map((p, i) => (
              <Reveal key={p.caption} delay={i * 60}>
                <SurfacePlate
                  kind={p.kind}
                  caption={p.caption}
                  note={p.note}
                  delay={i * 140}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Process: a real sequence, so it's numbered ——— */}
      <section className="bg-chalk-2 border-y border-prussian/10">
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

      {/* ——— Proof ——— */}
      <section className="bg-chalk">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="From the coast"
              title="What people say after."
            />
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {site.reviews.map((r, i) => (
              <Reveal key={r.quote} delay={i * 90}>
                <figure className="flex h-full flex-col rounded-lg border border-prussian/12 bg-chalk-2 p-8">
                  <FanRule className="text-spray" />
                  <blockquote className="mt-6 flex-1 font-display text-[1.15rem] leading-[1.45] tracking-[-0.015em] text-prussian text-balance">
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>
                  <figcaption className="spec mt-6 text-stone">
                    {r.who} · {r.where}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
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
        </div>
      </section>

      {/* ——— Quote ——— */}
      <section id="quote" className="bg-prussian text-chalk">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-20">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="Free written quote"
              title="Tell us what it looks like."
              lede="Describe the surface and we'll come back with a written number — no visit needed for most driveways and single-storey homes."
            />

            <div className="mt-10 space-y-5">
              <a
                href={site.contact.phoneHref}
                className="flex items-center gap-4 text-chalk transition-colors duration-200 hover:text-spray-lit"
              >
                <IconPhone className="h-5 w-5 text-spray-lit" />
                <span className="font-display text-xl font-semibold tracking-[-0.02em]">
                  {site.contact.phoneDisplay}
                </span>
              </a>
              <p className="flex items-center gap-4 text-efflor">
                <IconMapPin className="h-5 w-5 text-spray-lit" />
                {site.serviceArea.slice(0, 4).join(" · ")} &amp;{" "}
                <Link
                  href="/wash/contact"
                  className="underline underline-offset-4 hover:text-chalk"
                >
                  more of the coast
                </Link>
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-xl bg-chalk p-7 text-prussian sm:p-9">
              <Eyebrow>Request a quote</Eyebrow>
              <div className="mt-6">
                <QuoteForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
