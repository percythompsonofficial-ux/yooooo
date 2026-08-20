import Link from "next/link";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/tattoo/Marquee";
import TattooImage from "@/components/tattoo/TattooImage";
import FlashCard from "@/components/tattoo/FlashCard";
import { ButtonLink, Eyebrow, SectionHeading, StarRule } from "@/components/tattoo/ui";
import { IconArrow, IconClock, IconPin, IconStar } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export default function TattooHome() {
  const featured = site.flash.slice(0, 4);
  return (
    <>
      {/* ——— Hero: full-bleed photo, poster type ——— */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden grain">
        <TattooImage
          src="" /* set to "/photos/tattoo/hero.jpg" once the photo exists */
          alt=""
          design="sheet"
          className="absolute inset-0"
          imgClassName="object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-void via-void/85 to-void/45"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pb-16 pt-40 w-full">
          <Eyebrow className="animate-fade-up">
            Biloxi, Mississippi · Est. 2016
          </Eyebrow>
          <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.88] text-[clamp(3.4rem,11vw,9.5rem)] text-salt animate-fade-up">
            Ink that
            <br />
            <span className="stroke-volt">outlasts</span> the tide
          </h1>
          <p className="mt-6 max-w-xl text-salt/85 text-lg leading-relaxed animate-fade-up">
            Custom tattoos drawn for you by three resident artists. Walk-ins
            welcome for flash and small pieces, every day we&apos;re open.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 animate-fade-up">
            <ButtonLink href="/tattoo/booking">
              Book a consult <IconArrow className="w-4 h-4" />
            </ButtonLink>
            <ButtonLink href="/tattoo/work" variant="outline">
              See the work
            </ButtonLink>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-smoke animate-fade-up">
            <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
              <IconPin className="w-4 h-4 text-volt" /> {site.contact.address}
            </span>
            <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
              <IconClock className="w-4 h-4 text-volt" /> Tue–Sat 12–9 · Sun 1–6
            </span>
          </div>
        </div>
      </section>

      {/* ——— Signature: flash-sheet marquee ——— */}
      <Marquee />

      {/* ——— What we do ——— */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="The shop"
            title={
              <>
                Custom work, honest
                <br />
                <span className="stroke-salt">quotes</span>, clean lines
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

      {/* ——— Featured work ——— */}
      <section className="bg-char/60 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="The flash wall" title="Book it as drawn" />
            <Link
              href="/tattoo/work"
              className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-volt hover:text-salt transition-colors duration-200 pb-2"
            >
              All flash →
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((f, i) => (
              <Reveal key={f.name} delay={(i % 4) * 80}>
                <FlashCard item={f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Artists teaser ——— */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <Reveal>
          <SectionHeading eyebrow="Resident artists" title="Three chairs, three voices" />
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {site.artists.map((a, i) => (
            <Reveal key={a.slug} delay={i * 90}>
              <Link href="/tattoo/artists" className="group block">
                <TattooImage
                  src={a.photo}
                  alt={`${a.name}, ${a.role}`}
                  design={a.design}
                  className="aspect-[3/4]"
                  imgClassName="grayscale group-hover:grayscale-0 transition-[filter,transform] duration-700 group-hover:scale-[1.02]"
                />
                <h3 className="mt-4 font-display font-bold uppercase text-2xl text-salt group-hover:text-volt transition-colors duration-200">
                  {a.name}
                </h3>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">
                  {a.role}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee />

      {/* ——— Process — the one numbered sequence ——— */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Consult to <span className="stroke-volt">healed</span>
              </>
            }
          />
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {site.process.map((p, i) => (
            <Reveal key={p.step} delay={i * 90}>
              <li className="border-t-2 border-volt pt-5 h-full">
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-flash">
                  {p.step}
                </span>
                <h3 className="mt-2 font-display font-bold uppercase text-2xl text-salt">
                  {p.title}
                </h3>
                <p className="mt-3 text-salt/70 leading-relaxed text-[0.95rem]">
                  {p.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ——— Reviews ——— */}
      <section className="bg-char/60 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <StarRule />
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {site.reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 90}>
                <blockquote className="h-full flex flex-col">
                  <p className="text-lg text-salt/90 leading-relaxed flex-1">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <footer className="mt-6">
                    <p className="font-display font-bold uppercase tracking-[0.04em] text-salt">
                      {r.name}
                    </p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-volt mt-1">
                      {r.detail}
                    </p>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Final CTA ——— */}
      <section className="relative overflow-hidden grain">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-28 text-center">
          <Reveal>
            <h2 className="font-display font-extrabold uppercase leading-[0.9] text-[clamp(2.8rem,8vw,6.5rem)] text-salt">
              Your skin,
              <br />
              <span className="stroke-volt">your story</span>
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-salt/75 leading-relaxed">
              Consults are free and obligation-free. Tell us the idea — we&apos;ll
              tell you exactly what it takes to do it right.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/tattoo/booking">
                Book a consult <IconArrow className="w-4 h-4" />
              </ButtonLink>
              <ButtonLink href={site.contact.phoneHref} variant="outline">
                Call {site.contact.phoneDisplay}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
