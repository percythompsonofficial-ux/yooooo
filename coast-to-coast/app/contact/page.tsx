import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import QuoteForm from "@/components/QuoteForm";
import { site } from "@/lib/site";
import { IconPhone } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a free roof inspection from Coast to Coast Roofing in Biloxi, MS. Call (228) 234-1371 or send us a message. Serving the Mississippi Gulf Coast.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero idPrefix="ct" eyebrow="Contact" title={<>Free inspection,<br />no pressure</>} lede="Tell us what's going on with your roof and we'll call you right back to set up a free inspection." />

      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
            <Reveal>
              <div className="bg-white border border-slate/10 p-8 sm:p-10">
                <h2 className="font-display uppercase text-2xl font-bold text-slate">Request your free inspection</h2>
                <p className="mt-2 text-sm text-ink/60">We&apos;ll get back to you fast — usually the same day.</p>
                <div className="mt-8"><QuoteForm /></div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <aside className="space-y-8">
                <a href={site.contact.phoneHref} className="block bg-slate text-white p-7 hover:bg-graphite transition-colors">
                  <span className="flex items-center gap-2 font-display uppercase text-xs tracking-cap text-amber">
                    <IconPhone className="w-4 h-4" /> Call or text
                  </span>
                  <span className="mt-3 block font-display font-bold text-3xl">{site.contact.phoneDisplay}</span>
                </a>

                <div className="border border-slate/15 p-7 bg-white">
                  <h3 className="font-display uppercase text-xs tracking-cap text-amber-deep mb-4">Email</h3>
                  <a href={`mailto:${site.contact.email}`} className="text-sm text-ink/80 hover:text-amber-deep transition-colors break-all">{site.contact.email}</a>

                  <h3 className="font-display uppercase text-xs tracking-cap text-amber-deep mb-4 mt-7">Location</h3>
                  <p className="text-sm text-ink/80">{site.contact.cityState}</p>

                  <h3 className="font-display uppercase text-xs tracking-cap text-amber-deep mb-4 mt-7">Find us</h3>
                  <a href={site.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-ink/80 hover:text-amber-deep transition-colors">Facebook</a>

                  <h3 className="font-display uppercase text-xs tracking-cap text-amber-deep mb-4 mt-7">Service area</h3>
                  <p className="text-sm text-ink/70 leading-relaxed">{site.serviceArea.join(" · ")}</p>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
