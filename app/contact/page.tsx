import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a free estimate from Songy Brothers Lawn & Landscape — lawn care and landscaping across the Mississippi Gulf Coast. Family owned & operated.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        idPrefix="ct"
        eyebrow="Get in touch"
        title={
          <>
            Let&apos;s talk about
            <br />
            your yard.
          </>
        }
        lede="Tell us what it needs and we'll get right back to you. No pressure, no obligation — just an honest quote."
      />

      <section className="bg-linen text-ink">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[1fr_340px]">
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal delay={120}>
              <aside className="space-y-10 lg:border-l lg:border-ink/15 lg:pl-12">
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Call or text
                  </h2>
                  <p className="text-sm leading-relaxed">
                    <a href={site.contact.phoneHref} className="text-ink/80 hover:text-brass-deep transition-colors">
                      {site.contact.phoneDisplay}
                    </a>
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Email
                  </h2>
                  <p className="text-sm leading-relaxed">
                    <a href={`mailto:${site.contact.email}`} className="text-ink/80 hover:text-brass-deep transition-colors">
                      {site.contact.email}
                    </a>
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Find us online
                  </h2>
                  <p className="text-sm leading-relaxed flex flex-col gap-2">
                    <a
                      href={site.contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink/80 hover:text-brass-deep transition-colors"
                    >
                      Facebook — Songy Brothers Lawn &amp; Landscape
                    </a>
                    <a
                      href={site.contact.booking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink/80 hover:text-brass-deep transition-colors"
                    >
                      Book online
                    </a>
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Service area
                  </h2>
                  <p className="text-sm leading-relaxed text-ink/75">
                    {site.serviceArea.join(" · ")}
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
