import Link from "next/link";
import Wordmark from "./Wordmark";

const serviceArea = [
  "Biloxi",
  "Ocean Springs",
  "Gulfport",
  "Pass Christian",
  "Diamondhead",
  "Bay St. Louis",
];

export default function Footer() {
  return (
    <footer className="relative bg-bark text-ivory grain overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-10 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="text-ivory" />
            <p className="mt-6 max-w-xs text-sm text-ivory/70 leading-relaxed">
              Estate-grade landscape design, build, and grounds care under the
              live oaks of the Mississippi Gulf Coast. Established in Biloxi.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs uppercase tracking-cap text-brass mb-5">
              Explore
            </h2>
            <ul className="space-y-3 text-sm">
              {[
                ["Services", "/services"],
                ["Portfolio", "/portfolio"],
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
              {serviceArea.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-cap text-brass mb-5">
              Visit &amp; Call
            </h2>
            <address className="not-italic text-sm text-ivory/80 space-y-3">
              <p>
                1200 Rue Magnolia
                <br />
                Biloxi, MS 39530
              </p>
              <p>
                <a
                  href="tel:+12285550184"
                  className="hover:text-brass transition-colors duration-200"
                >
                  (228) 555-0184
                </a>
              </p>
              <p>
                <a
                  href="mailto:studio@beaujardin.co"
                  className="hover:text-brass transition-colors duration-200"
                >
                  studio@beaujardin.co
                </a>
              </p>
              <p className="text-ivory/60">
                Mon–Fri 7:30a–5p
                <br />
                Sat by appointment
              </p>
            </address>
          </div>
        </div>

        <div className="bed-rule mt-16 mb-6 text-ivory" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>
            © {new Date().getFullYear()} Beau Jardin Landscape Co. All rights
            reserved.
          </p>
          <p>Licensed &amp; insured · MS Landscape Contractor</p>
        </div>
      </div>
    </footer>
  );
}
