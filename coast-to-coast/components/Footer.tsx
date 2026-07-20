import Link from "next/link";
import Logo from "./Logo";
import { IconPhone } from "./icons";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-slate text-fog">
      {/* CTA strip */}
      <div className="bg-amber">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <p className="font-display uppercase text-slate text-2xl sm:text-3xl font-bold leading-tight">
            Storm damage? Leak? Get a free inspection.
          </p>
          <a
            href={site.contact.phoneHref}
            className="shrink-0 inline-flex items-center gap-2 bg-slate text-white font-display uppercase font-semibold tracking-[0.1em] px-6 py-4 hover:bg-ink transition-colors"
          >
            <IconPhone className="w-5 h-5 text-amber" />
            {site.contact.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm text-steel leading-relaxed">
              Locally owned roofing on the Mississippi Gulf Coast. Quality work,
              competitive prices, free inspections.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display uppercase text-xs tracking-cap text-amber mb-5">
              Company
            </h2>
            <ul className="space-y-3 text-sm">
              {[
                ["Services", "/services"],
                ["Projects", "/projects"],
                ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-amber transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display uppercase text-xs tracking-cap text-amber mb-5">
              Service Area
            </h2>
            <ul className="space-y-3 text-sm text-steel">
              {site.serviceArea.slice(0, 6).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display uppercase text-xs tracking-cap text-amber mb-5">
              Get in Touch
            </h2>
            <address className="not-italic text-sm space-y-3 text-steel">
              <p>{site.contact.cityState}</p>
              <p>
                <a href={site.contact.phoneHref} className="text-white hover:text-amber transition-colors font-display font-semibold text-base tracking-wide">
                  {site.contact.phoneDisplay}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.contact.email}`} className="hover:text-amber transition-colors break-all">
                  {site.contact.email}
                </a>
              </p>
              <p>
                <a href={site.contact.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-amber transition-colors">
                  Facebook
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-steel">
          <p>© {new Date().getFullYear()} {site.name}, LLC. All rights reserved.</p>
          <p>BBB Accredited · Locally owned &amp; operated</p>
        </div>
      </div>
    </footer>
  );
}
