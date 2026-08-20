import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import BookingForm from "@/components/tattoo/BookingForm";
import Marquee from "@/components/tattoo/Marquee";
import { Eyebrow, SectionHeading, StarRule } from "@/components/tattoo/ui";
import { IconClock, IconPhone, IconPin } from "@/components/tattoo/icons";
import { site } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "Booking",
  description:
    "Book a free tattoo consult at Iron Tide Tattoo in Biloxi. Deposits, pricing, age policy, and how to prepare — all the answers before you ask.",
};

export default function BookingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-40 pb-16">
        <Eyebrow className="animate-fade-up">Booking</Eyebrow>
        <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.88] text-[clamp(3rem,9vw,7.5rem)] text-salt animate-fade-up">
          Start with a<br />
          <span className="stroke-volt">conversation</span>
        </h1>
        <p className="mt-6 max-w-xl text-salt/80 text-lg leading-relaxed animate-fade-up">
          Consults are free. Send the idea below, or skip the form — walk-ins
          for flash and small pieces are welcome any day we&apos;re open.
        </p>
      </section>

      <Marquee />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div>
            <h2 className="font-display font-bold uppercase text-3xl text-salt">
              Request a consult
            </h2>
            <div className="mt-8">
              <BookingForm />
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <aside className="space-y-8 lg:border-l lg:border-salt/10 lg:pl-10">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-volt">
                The shop
              </p>
              <a
                href={site.contact.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-3 text-salt/85 hover:text-volt transition-colors duration-200"
              >
                <IconPin className="w-5 h-5 mt-0.5 shrink-0 text-volt" />
                {site.contact.address}
              </a>
              <a
                href={site.contact.phoneHref}
                className="mt-3 flex items-center gap-3 text-salt/85 hover:text-volt transition-colors duration-200"
              >
                <IconPhone className="w-5 h-5 shrink-0 text-volt" />
                {site.contact.phoneDisplay}
              </a>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-volt">
                Hours
              </p>
              <ul className="mt-4 space-y-2 text-salt/85">
                {site.hours.map((h) => (
                  <li key={h.days} className="flex items-center gap-3">
                    <IconClock className="w-4 h-4 text-volt shrink-0" />
                    <span className="flex justify-between gap-6 w-full max-w-[15rem]">
                      <span>{h.days}</span>
                      <span className="text-smoke">{h.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-flash/40 bg-char p-6">
              <p className="font-display font-bold uppercase text-lg text-salt">
                18+ · valid ID required
              </p>
              <p className="mt-2 text-sm text-salt/70 leading-relaxed">
                Mississippi law, no exceptions — including with parental
                consent. Bring a government photo ID to every session.
              </p>
            </div>
          </aside>
        </Reveal>
      </section>

      <section className="bg-char/60 py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading center eyebrow="Before you ask" title="Straight answers" />
          </Reveal>
          <div className="mt-12 space-y-4">
            {site.faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="group border border-salt/15 bg-void open:border-volt/50 transition-colors duration-200">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-display font-bold uppercase tracking-[0.03em] text-lg text-salt group-open:text-volt">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="text-volt font-mono text-xl leading-none group-open:rotate-45 transition-transform duration-200"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-salt/75 leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <StarRule className="mt-16" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
