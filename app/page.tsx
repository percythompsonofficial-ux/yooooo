import Link from "next/link";
import OakScene from "@/components/OakScene";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import ProjectImage from "@/components/ProjectImage";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import {
  IconArrowRight,
  IconCompassRose,
  IconOak,
  IconQuote,
  IconTopiary,
  IconTrowel,
} from "@/components/icons";

const services = [
  {
    icon: IconTrowel,
    title: "Lawn Maintenance & Mowing",
    body: "Dependable weekly and biweekly mowing, edging, blowing, and trimming — the same crew, the same clean cut, every visit.",
  },
  {
    icon: IconCompassRose,
    title: "Landscape Design & Installation",
    body: "New beds, plantings, borders, and full yard makeovers designed for Gulf Coast heat, sand, and salt air.",
  },
  {
    icon: IconTopiary,
    title: "Shrubs, Hedges & Flower Beds",
    body: "Pruning, shaping, mulching, and seasonal color that keep your beds sharp and your shrubs healthy year-round.",
  },
  {
    icon: IconOak,
    title: "Tree Trimming & Removal",
    body: "Careful trimming, storm cleanup, and safe removals — keeping your trees healthy and your property protected.",
  },
];

const work = [
  {
    variant: "cottage" as const,
    photo:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=70",
    photoAlt: "Freshly planted and mulched landscape beds along a home",
    title: "Landscape Installations",
    place: "Design & planting",
    summary: "Fresh beds, new plantings, and full front-yard makeovers built to last.",
  },
  {
    variant: "coastal" as const,
    photo:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=70",
    photoAlt: "A neatly mowed and edged green lawn",
    title: "Lawn Maintenance",
    place: "Weekly & biweekly care",
    summary: "Crisp mowing, edging, and cleanup that keeps a yard looking cared-for.",
  },
  {
    variant: "parterre" as const,
    photo:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70",
    photoAlt: "A lush, freshly sodded green lawn in front of a home",
    title: "Sod & Resodding",
    place: "New lawns",
    summary: "Tired turf pulled and replaced with fresh, healthy sod graded to drain.",
  },
];

export default function Home() {
  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative min-h-dvh flex items-center justify-center overflow-hidden grain">
        <OakScene className="absolute inset-0 w-full h-full" idPrefix="hero" />
        <div className="relative z-10 px-6 text-center animate-fade-in">
          <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <h1>
              <Wordmark stacked className="text-ivory drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]" />
            </h1>
          </div>
          <p
            className="mt-8 max-w-md mx-auto text-sm sm:text-base text-mist/90 animate-fade-up"
            style={{ animationDelay: "0.8s" }}
          >
            {site.tagline} Honest work, fair prices, and free estimates.
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "1.1s" }}
          >
            <ButtonLink href="/contact">Get a Free Estimate</ButtonLink>
            <ButtonLink href="/portfolio" variant="outline">
              See Our Work
            </ButtonLink>
          </div>
        </div>
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in"
          style={{ animationDelay: "1.8s" }}
          aria-hidden="true"
        >
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-ivory/60 to-ivory/10" />
        </div>
      </section>

      {/* ——— Statement ——— */}
      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 py-24 sm:py-36 text-center">
          <Reveal>
            <p className="text-[0.7rem] sm:text-xs uppercase tracking-cap text-brass-deep">
              Family owned &amp; operated — Mississippi Gulf Coast
            </p>
            <p className="mt-8 font-display text-[clamp(1.7rem,3.6vw,2.9rem)] leading-[1.3] font-medium">
              Two brothers, one standard: a yard we&apos;d be proud to put our
              name on.{" "}
              <em className="text-brass-deep">
                Best price, highest quality — every job.
              </em>
            </p>
            <div className="bed-rule mt-14 max-w-52 mx-auto text-ink" />
          </Reveal>
        </div>
      </section>

      {/* ——— Services ——— */}
      <section className="bg-parchment text-ink">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <SectionHeading
                eyebrow="What we do"
                title={
                  <>
                    From weekly mowing
                    <br />
                    to full landscapes
                  </>
                }
              />
              <ButtonLink href="/services" variant="outline-dark" className="shrink-0">
                All Services
              </ButtonLink>
            </div>
          </Reveal>

          <div className="mt-16 border border-ink/20 grid sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 90}
                className="group border-ink/20 border-b sm:border-r last:border-b-0 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0"
              >
                <Link
                  href="/services"
                  className="block h-full p-8 lg:p-10 transition-colors duration-300 hover:bg-linen"
                >
                  <s.icon className="w-9 h-9 text-brass-deep" />
                  <h3 className="mt-6 font-display text-2xl font-semibold leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink/70">
                    {s.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-brass-deep opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <IconArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Featured work ——— */}
      <section className="bg-fern text-ivory grain relative">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 relative z-10">
          <Reveal>
            <SectionHeading
              dark
              center
              eyebrow="Our work"
              title="Yards across the Coast"
            />
          </Reveal>
          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {work.map((pr, i) => (
              <Reveal key={pr.title} delay={i * 110}>
                <Link href="/portfolio" className="group block">
                  <div className="overflow-hidden">
                    <ProjectImage
                      src={pr.photo}
                      alt={pr.photoAlt}
                      variant={pr.variant}
                      className="w-full aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-6 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold group-hover:text-brass transition-colors duration-200">
                      {pr.title}
                    </h3>
                    <IconArrowRight className="w-5 h-5 text-brass shrink-0 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-sage">
                    {pr.place}
                  </p>
                  <p className="mt-3 text-sm text-ivory/70 leading-relaxed">
                    {pr.summary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Testimonial ——— */}
      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 py-24 sm:py-32 text-center">
          <Reveal>
            <IconQuote className="w-10 h-10 mx-auto text-brass-deep" />
            <blockquote className="mt-8">
              <p className="font-display text-[clamp(1.5rem,3vw,2.3rem)] leading-[1.35] font-medium">
                “The most conscientious, dedicated, and trustworthy lawn
                professionals I have hired.”
              </p>
              <footer className="mt-8 text-xs uppercase tracking-cap text-ink/60">
                Verified customer review
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ——— CTA band ——— */}
      <section className="relative bg-pine text-ivory overflow-hidden grain">
        <div className="absolute inset-0 opacity-60">
          <OakScene className="w-full h-full" idPrefix="cta" />
        </div>
        <div className="absolute inset-0 bg-pine/55" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 sm:px-8 py-28 sm:py-40 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-cap text-brass">
              Free estimates across the Gulf Coast
            </p>
            <h2 className="mt-5 font-display font-medium text-[clamp(2.2rem,5vw,4rem)] leading-[1.08]">
              Ready for a yard
              <br />
              you&apos;re proud of?
            </h2>
            <div className="mt-10">
              <ButtonLink href="/contact">Get a Free Estimate</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
