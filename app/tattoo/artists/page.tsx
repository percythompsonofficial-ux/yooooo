import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/tattoo/Marquee";
import TattooImage from "@/components/tattoo/TattooImage";
import { ButtonLink, Eyebrow } from "@/components/tattoo/ui";
import { IconArrow, IconInstagram } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "The Artist",
  description:
    "InkdUpJo (Tatz by Jo) — custom script, black-and-grey, portraits, and sleeve work in Gautier, Mississippi. Booking through Instagram DMs.",
};

export default function ArtistPage() {
  const artist = site.artists[0];
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-40 pb-16">
        <Eyebrow className="animate-fade-up">The artist</Eyebrow>
        <h1 className="mt-5 font-display leading-[0.88] text-[clamp(3rem,9vw,7.5rem)] text-salt animate-fade-up">
          {site.name}
        </h1>
        <p className="mt-6 max-w-xl text-salt/80 text-lg leading-relaxed animate-fade-up">
          {site.studio} — every piece drawn for the person wearing it.
        </p>
      </section>

      <Marquee />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <Reveal>
          <article className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <TattooImage
              src={artist.photo}
              alt={`Portrait of ${artist.name}`}
              label={artist.name}
              className="aspect-[4/3]"
            />
            <div>
              <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.95] text-salt">
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
                  DM to book <IconArrow className="w-4 h-4" />
                </ButtonLink>
                <ButtonLink href={artist.instagram} variant="outline">
                  <IconInstagram className="w-4 h-4" /> Portfolio
                </ButtonLink>
              </div>
            </div>
          </article>
        </Reveal>
      </section>
    </>
  );
}
