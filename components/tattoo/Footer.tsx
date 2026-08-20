import Link from "next/link";
import { site } from "@/lib/tattoo-site";
import { IconInstagram, IconPin, IconStar } from "./icons";

export default function Footer() {
  return (
    <footer className="border-t border-salt/10 bg-void">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2.5">
            <IconStar className="w-5 h-5 text-volt" />
            <span className="font-display font-extrabold uppercase tracking-[0.08em] text-xl text-salt">
              {site.fullName}
            </span>
          </p>
          <p className="mt-3 text-sm text-smoke leading-relaxed">{site.tagline}</p>
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-salt/80 hover:text-volt transition-colors duration-200"
          >
            <IconInstagram className="w-5 h-5" />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              @irontidetattoo
            </span>
          </a>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-volt">
            Hours
          </p>
          <ul className="mt-4 space-y-2 text-sm text-salt/80">
            {site.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-6 max-w-[16rem]">
                <span>{h.days}</span>
                <span className="text-smoke">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-volt">
            Find us
          </p>
          <a
            href={site.contact.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-start gap-2 text-sm text-salt/80 hover:text-volt transition-colors duration-200"
          >
            <IconPin className="w-4 h-4 mt-0.5 shrink-0" />
            {site.contact.address}
          </a>
          <a
            href={site.contact.phoneHref}
            className="mt-3 block text-sm text-salt/80 hover:text-volt transition-colors duration-200"
          >
            {site.contact.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.contact.email}`}
            className="mt-1 block text-sm text-salt/80 hover:text-volt transition-colors duration-200 break-all"
          >
            {site.contact.email}
          </a>
        </div>
      </div>

      <div className="border-t border-salt/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">
            © {new Date().getFullYear()} {site.fullName} · 18+ with valid ID
          </p>
          <Link
            href="/tattoo/booking"
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-volt hover:text-salt transition-colors duration-200"
          >
            Book a consult →
          </Link>
        </div>
      </div>
    </footer>
  );
}
