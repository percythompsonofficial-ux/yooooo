import type { Metadata } from "next";
import WorkGallery from "./WorkGallery";
import Marquee from "@/components/tattoo/Marquee";
import { ButtonLink, Eyebrow } from "@/components/tattoo/ui";
import { IconArrow } from "@/components/tattoo/icons";

export const metadata: Metadata = {
  title: "Flash",
  description:
    "The Iron Tide flash wall — original designs by our artists, priced and ready to book as drawn. Walk in and pick one off the sheet.",
};

export default function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-40 pb-16">
        <Eyebrow className="animate-fade-up">The flash wall</Eyebrow>
        <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.88] text-[clamp(3rem,9vw,7.5rem)] text-salt animate-fade-up">
          Pick it off
          <br />
          <span className="stroke-volt">the wall</span>
        </h1>
        <p className="mt-6 max-w-xl text-salt/80 text-lg leading-relaxed animate-fade-up">
          Original designs drawn by our artists, priced as shown and ready to
          tattoo as-is. Want one changed to fit you? That&apos;s a consult.
        </p>
      </section>

      <Marquee />

      <WorkGallery />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24 text-center">
        <p className="text-salt/75">Want something of your own instead?</p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/tattoo/booking">
            Book a consult <IconArrow className="w-4 h-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
