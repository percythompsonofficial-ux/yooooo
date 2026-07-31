import type { Metadata } from "next";
import PageHero from "@/components/wash/PageHero";
import Reveal from "@/components/wash/Reveal";
import QuoteForm from "@/components/wash/QuoteForm";
import { SectionHeading, Eyebrow } from "@/components/wash/ui";
import { site } from "@/lib/wash-site";
import {
  IconPhone,
  IconMapPin,
  IconClock,
  IconDroplet,
  IconShield,
  IconThermometer,
} from "@/components/wash/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get a free written quote for pressure washing or soft washing on the Mississippi Gulf Coast. Call, email, or send a description of the surface.",
};

const faqs = [
  {
    q: "Do you need to be there when we come?",
    a: "Not usually. We need access to an outside tap and somewhere to park the trailer. Most driveways and single-storey homes get quoted from photos and washed while you're at work.",
  },
  {
    q: "How long does it last?",
    a: "On the coast, a driveway holds up about two to three years and a soft-washed roof three to five. Anyone promising longer than that hasn't washed many houses in this humidity.",
  },
  {
    q: "Will it damage my plants?",
    a: "Beds get soaked with clean water before anything is applied and flushed again afterward. That's what keeps detergent from concentrating in the soil, and it's a step cheap jobs skip.",
  },
  {
    q: "What about my water bill?",
    a: "A typical driveway runs eight gallons a minute for an hour or two. On most coast water rates that's a couple of dollars.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what it looks like."
        lede="A description and a photo are usually enough for a written number. If it's a bigger property or something unusual, we'll come out and look — that visit is free too."
      />

      <section className="bg-chalk">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
          {/* ——— Details ——— */}
          <Reveal>
            <SectionHeading
              eyebrow="Reach us"
              title="Straight to the trailer."
            />

            <div className="mt-10 space-y-7">
              <a
                href={site.contact.phoneHref}
                className="flex items-start gap-4 transition-colors duration-200 hover:text-spray-ink"
              >
                <IconPhone className="mt-1 h-5 w-5 shrink-0 text-spray" />
                <span>
                  <span className="spec block text-stone">Phone</span>
                  <span className="mt-1 block font-display text-xl font-semibold tracking-[-0.02em]">
                    {site.contact.phoneDisplay}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${site.contact.email}`}
                className="flex items-start gap-4 transition-colors duration-200 hover:text-spray-ink"
              >
                <IconDroplet className="mt-1 h-5 w-5 shrink-0 text-spray" />
                <span>
                  <span className="spec block text-stone">Email</span>
                  <span className="mt-1 block font-display text-lg font-semibold tracking-[-0.02em] break-all">
                    {site.contact.email}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-4">
                <IconClock className="mt-1 h-5 w-5 shrink-0 text-spray" />
                <span>
                  <span className="spec block text-stone">Hours</span>
                  <span className="mt-1 block text-[1.0625rem] text-prussian/85">
                    {site.contact.hours}
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-4">
                <IconMapPin className="mt-1 h-5 w-5 shrink-0 text-spray" />
                <span>
                  <span className="spec block text-stone">Based in</span>
                  <span className="mt-1 block text-[1.0625rem] text-prussian/85">
                    {site.contact.cityState}
                  </span>
                  <span className="mt-2 block text-[0.9375rem] leading-relaxed text-stone">
                    Serving {site.serviceArea.join(", ")}.
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-12 rounded-lg border border-prussian/12 bg-chalk-2 p-7">
              <Eyebrow>On the trailer</Eyebrow>
              <ul className="mt-5 space-y-4">
                {[
                  {
                    Icon: IconThermometer,
                    text: "200°F hot water — lifts oil and grease cold water leaves behind",
                  },
                  {
                    Icon: IconDroplet,
                    text: "8 GPM at 4,000 PSI, dialled down to whatever the surface takes",
                  },
                  {
                    Icon: IconShield,
                    text: "Licensed and insured, certificate available on request",
                  },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex gap-3.5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-spray" />
                    <span className="text-[0.9375rem] leading-relaxed text-stone">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ——— Form ——— */}
          <Reveal delay={120}>
            <div className="rounded-xl border border-prussian/12 bg-chalk-2 p-7 sm:p-9">
              <Eyebrow>Free written quote</Eyebrow>
              <h2 className="mt-4 font-display text-[1.7rem] font-semibold tracking-[-0.03em] text-prussian">
                Request a quote
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                We answer with a written number, usually the same day.
              </p>
              <div className="mt-8">
                <QuoteForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="border-t border-prussian/10 bg-chalk-2">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Before you ask"
              title="The four we get most."
            />
          </Reveal>

          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={(i % 2) * 80}>
                <div className="border-t border-prussian/15 pt-6">
                  <dt className="font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-prussian text-balance">
                    {f.q}
                  </dt>
                  <dd className="mt-3 max-w-[52ch] leading-relaxed text-stone">
                    {f.a}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
