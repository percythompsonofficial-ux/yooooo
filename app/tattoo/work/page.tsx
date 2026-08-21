import type { Metadata } from "next";
import WorkGallery from "./WorkGallery";
import Marquee from "@/components/tattoo/Marquee";
import { ButtonLink, Eyebrow } from "@/components/tattoo/ui";
import { IconArrow } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Recent tattoos by InkdUpJo of Gautier, Mississippi — custom script, black-and-grey realism, portraits, and sleeve work.",
};

export default function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-40 pb-16">
        <Eyebrow className="animate-fade-up">The gallery</Eyebrow>
        <h1 className="mt-5 font-display leading-[0.88] text-[clamp(3rem,9vw,7.5rem)] text-salt animate-fade-up">
          Recent
          <br />
          <span className="stroke-volt">work</span>
        </h1>
        <p className="mt-6 max-w-xl text-salt/80 text-lg leading-relaxed animate-fade-up">
          Pieces off the machine — script, black-and-grey, portraits, and
          sleeve work. Filter by style to find your lane.
        </p>
      </section>

      <Marquee />

      <WorkGallery />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24 text-center">
        <p className="text-salt/75">Want something like this of your own?</p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href={site.contact.instagram}>
            DM to book <IconArrow className="w-4 h-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
