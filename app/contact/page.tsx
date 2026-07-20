import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a consultation with Beau Jardin Landscape Co. — landscape design, build, and estate grounds care in Biloxi, Mississippi. (228) 555-0184.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        idPrefix="ct"
        eyebrow="Contact"
        title={
          <>
            Begin with
            <br />a conversation
          </>
        }
        lede="Tell us about your grounds. We'll reply within one business day to arrange a walk of the property."
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
                    The studio
                  </h2>
                  <address className="not-italic text-sm leading-relaxed text-ink/75">
                    1200 Rue Magnolia
                    <br />
                    Biloxi, MS 39530
                  </address>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Call or write
                  </h2>
                  <p className="text-sm leading-relaxed">
                    <a href="tel:+12285550184" className="text-ink/80 hover:text-brass-deep transition-colors">
                      (228) 555-0184
                    </a>
                    <br />
                    <a href="mailto:studio@beaujardin.co" className="text-ink/80 hover:text-brass-deep transition-colors">
                      studio@beaujardin.co
                    </a>
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Hours
                  </h2>
                  <p className="text-sm leading-relaxed text-ink/75">
                    Monday–Friday, 7:30a–5p
                    <br />
                    Saturday by appointment
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-cap text-brass-deep mb-4">
                    Service area
                  </h2>
                  <p className="text-sm leading-relaxed text-ink/75">
                    Biloxi · Ocean Springs · Gulfport
                    <br />
                    Pass Christian · Diamondhead · Bay St. Louis
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
