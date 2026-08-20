import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/tattoo/Marquee";
import TattooImage from "@/components/tattoo/TattooImage";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/tattoo/ui";
import { IconArrow, IconInstagram } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Meet the three resident artists at Iron Tide Tattoo in Biloxi — American traditional, fine line and realism, blackwork and Japanese.",
};

export default function ArtistsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-40 pb-16">
        <Eyebrow className="animate-fade-up">Resident artists</Eyebrow>
        <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.88] text-[clamp(3rem,9vw,7.5rem)] text-salt animate-fade-up">
          The hands behind
          <br />
          <span className="stroke-volt">the machines</span>
        </h1>
        <p className="mt-6 max-w-xl text-salt/80 text-lg leading-relaxed animate-fade-up">
          Every piece at Iron Tide is drawn by the artist who tattoos it. Pick
          by portfolio, not by chair number — or tell us the idea and we&apos;ll
          match you.
        </p>
      </section>

      <Marquee />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 space-y-24">
        {site.artists.map((a, i) => (
          <Reveal key={a.slug}>
            <article
              className={`grid gap-10 lg:grid-cols-2 lg:items-center ${
                i % 2 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <TattooImage
                src={a.photo}
                alt={`Portrait of ${a.name}`}
                design={a.design}
                className="aspect-[4/3]"
              />
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-flash">
                  {a.years} in the trade
                </p>
                <h2 className="mt-3 font-display font-extrabold uppercase text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] text-salt">
                  {a.name}
                </h2>
                <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">
                  {a.role}
                </p>
                <p className="mt-5 text-salt/75 leading-relaxed max-w-prose">{a.bio}</p>
                <div className="mt-7 flex flex-wrap gap-4">
                  <ButtonLink href="/tattoo/booking">
                    Book with {a.name.split(" ")[0]} <IconArrow className="w-4 h-4" />
                  </ButtonLink>
                  <ButtonLink href={a.instagram} variant="outline">
                    <IconInstagram className="w-4 h-4" /> Portfolio
                  </ButtonLink>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="bg-char/60 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <Reveal>
            <SectionHeading
              center
              eyebrow="Guest spots"
              title={
                <>
                  Traveling artist? <span className="stroke-salt">Write us</span>
                </>
              }
            />
            <p className="mt-5 max-w-lg mx-auto text-salt/75 leading-relaxed">
              We host two guest artists a season. Send your portfolio and dates
              to{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="text-volt underline underline-offset-4 hover:text-salt transition-colors duration-200"
              >
                {site.contact.email}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
