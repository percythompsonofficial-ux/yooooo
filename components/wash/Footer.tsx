import Link from "next/link";
import Logo from "./Logo";
import { IconPhone, IconMapPin, IconClock } from "./icons";
import { site, services } from "@/lib/wash-site";

export default function Footer() {
  return (
    <footer className="bg-prussian text-chalk">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-[38ch] text-[0.9375rem] leading-relaxed text-efflor">
              Exterior surface restoration across the Mississippi Gulf Coast —
              driveways, siding, roofs, masonry, wood and pavers, each at the
              pressure its material can take.
            </p>
            <div className="mt-7 space-y-3 text-[0.9375rem]">
              <a
                href={site.contact.phoneHref}
                className="flex items-center gap-3 text-chalk transition-colors duration-200 hover:text-spray-lit"
              >
                <IconPhone className="h-[18px] w-[18px] text-spray-lit" />
                {site.contact.phoneDisplay}
              </a>
              <p className="flex items-center gap-3 text-efflor">
                <IconMapPin className="h-[18px] w-[18px] text-spray-lit" />
                {site.contact.cityState}
              </p>
              <p className="flex items-center gap-3 text-efflor">
                <IconClock className="h-[18px] w-[18px] text-spray-lit" />
                {site.contact.hours}
              </p>
            </div>
          </div>

          <nav aria-label="Services">
            <p className="spec text-spray-lit">Services</p>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href="/wash/services"
                    className="text-efflor transition-colors duration-200 hover:text-chalk"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="spec text-spray-lit">Service area</p>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-efflor">
              {site.serviceArea.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-chalk/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="spec text-efflor/70">
            © {new Date().getFullYear()} {site.name}
          </p>
          <p className="spec text-efflor/70">
            Licensed &amp; insured · Free written quotes
          </p>
        </div>
      </div>
    </footer>
  );
}
