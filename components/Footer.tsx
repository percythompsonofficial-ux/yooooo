import Link from "next/link";
import Wordmark from "./Wordmark";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative bg-bark text-ivory grain overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-10 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="text-ivory" />
            <p className="mt-6 max-w-xs text-sm text-ivory/70 leading-relaxed">
              Family-owned lawn care and landscaping serving the Mississippi Gulf
              Coast. Honest work, fair prices, free estimates.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs uppercase tracking-cap text-brass mb-5">
              Explore
            </h2>
            <ul className="space-y-3 text-sm">
              {[
                ["Services", "/services"],
                ["Our Work", "/portfolio"],
                ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-ivory/80 hover:text-brass transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-cap text-brass mb-5">
              Service Area
            </h2>
            <ul className="space-y-3 text-sm text-ivory/80">
              {site.serviceArea.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-cap text-brass mb-5">
              Get in Touch
            </h2>
            <address className="not-italic text-sm text-ivory/80 space-y-3">
              <p>Serving the Mississippi Gulf Coast</p>
              <p>
                <a
                  href={site.contact.phoneHref}
                  className="hover:text-brass transition-colors duration-200"
                >
                  {site.contact.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="hover:text-brass transition-colors duration-200"
                >
                  {site.contact.email}
                </a>
              </p>
              <p className="flex gap-4 pt-1">
                <a
                  href={site.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brass transition-colors duration-200"
                >
                  Facebook
                </a>
                <a
                  href={site.contact.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brass transition-colors duration-200"
                >
                  Book online
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="bed-rule mt-16 mb-6 text-ivory" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </p>
          <p>Family owned &amp; operated · Free estimates</p>
        </div>
      </div>
    </footer>
  );
}
