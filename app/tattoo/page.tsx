import Link from "next/link";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/tattoo/Marquee";
import TattooImage from "@/components/tattoo/TattooImage";
import WorkCard from "@/components/tattoo/WorkCard";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/tattoo/ui";
import { IconArrow, IconInstagram, IconStar } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export default function TattooHome() {
  const artist = site.artists[0];
  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <TattooImage
          src="/photos/tattoo/work-madonna.jpg"
          alt=""
          label=""
          className="absolute inset-0"
          objectPosition="center 20%"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-void via-void/85 to-void/50"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pb-16 pt-40 w-full">
          <Eyebrow className="animate-fade-up">
            {site.location} · {site.altName}
          </Eyebrow>
          <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.88] text-[clamp(3.4rem,11vw,9.5rem)] text-salt animate-fade-up">
            Ink that
            <br />
            <span className="stroke-volt">holds up</span>
          </h1>
          <p className="mt-6 max-w-xl text-salt/85 text-lg leading-relaxed animate-fade-up">
            Custom script, black-and-grey, and sleeve work out of Gautier,
            Mississippi. Send the idea over and it gets drawn for you.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 animate-fade-up">
            <ButtonLink href={site.contact.instagram}>
              DM to book <IconArrow className="w-4 h-4" />
            </ButtonLink>
            <ButtonLink href="/tattoo/work" variant="outline">
              See the work
            </ButtonLink>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ——— What he does ——— */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="The work"
            title={
              <>
                Drawn for you,
                <br />
                <span className="stroke-salt">not off a wall</span>
              </>
            }
          />
        </Reveal>
        <div className="mt-14 grid gap-px bg-salt/10 sm:grid-cols-2">
          {site.services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="bg-void p-8 sm:p-10 h-full hover:bg-char transition-colors duration-300">
                <IconStar className="w-5 h-5 text-flash" />
                <h3 className="mt-5 font-display font-bold uppercase text-2xl tracking-[0.02em] text-salt">
                  {s.title}
                </h3>
                <p className="mt-3 text-salt/70 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— Recent work ——— */}
      <section className="bg-char/60 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Recent work" title="Straight off the arm" />
            <Link
              href="/tattoo/work"
              className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-volt hover:text-salt transition-colors duration-200 pb-2"
            >
              All work →
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {site.work.map((w, i) => (
              <Reveal key={w.slug} delay={(i % 4) * 80}>
                <WorkCard item={w} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— The artist ——— */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <TattooImage
              src={artist.photo}
              alt={`Portrait of ${artist.name}`}
              label={artist.name}
              className="aspect-[4/3]"
            />
            <div>
              <Eyebrow>The artist</Eyebrow>
              <h2 className="mt-4 font-display font-extrabold uppercase text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] text-salt">
                {artist.name}
              </h2>
              <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">
                {artist.role}
              </p>
              <p className="mt-5 text-salt/75 leading-relaxed max-w-prose">
                {artist.bio}
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <ButtonLink href={site.contact.instagram}>
                  <IconInstagram className="w-4 h-4" /> {site.contact.instagramHandle}
                </ButtonLink>
                <ButtonLink href="/tattoo/booking" variant="outline">
                  Booking info
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Marquee />

      {/* ——— Final CTA ——— */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-28 text-center">
          <Reveal>
            <h2 className="font-display font-extrabold uppercase leading-[0.9] text-[clamp(2.8rem,8vw,6.5rem)] text-salt">
              Your skin,
              <br />
              <span className="stroke-volt">your story</span>
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-salt/75 leading-relaxed">
              Send your idea, the placement, and a rough size. You&apos;ll get a
              straight answer on what it takes before anything is booked.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href={site.contact.instagram}>
                DM to book <IconArrow className="w-4 h-4" />
              </ButtonLink>
              <ButtonLink href="/tattoo/booking" variant="outline">
                Booking info
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
