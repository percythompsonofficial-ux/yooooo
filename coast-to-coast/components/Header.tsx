"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { IconPhone } from "./icons";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-slate border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between h-[72px]">
        <Link href="/" aria-label="Coast to Coast Roofing — home">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`font-display uppercase text-sm tracking-[0.12em] transition-colors duration-200 ${
                  active ? "text-amber" : "text-fog hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href={site.contact.phoneHref}
            className="flex items-center gap-2 text-white hover:text-amber transition-colors"
          >
            <IconPhone className="w-5 h-5 text-amber" />
            <span className="font-display font-semibold tracking-wide">
              {site.contact.phoneDisplay}
            </span>
          </a>
          <Link
            href="/contact"
            className="font-display uppercase text-sm font-semibold tracking-[0.1em] bg-amber text-white hover:bg-amber-deep px-5 py-3 transition-colors"
          >
            Free Inspection
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="lg:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[6px] text-white cursor-pointer"
        >
          <span className={`block w-7 h-0.5 bg-current transition-transform duration-300 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
          <span className={`block w-7 h-0.5 bg-current transition-transform duration-300 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 top-[72px] bg-slate transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav aria-label="Mobile" className="h-full overflow-y-auto flex flex-col items-center justify-center gap-1 py-12">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`font-display uppercase text-3xl tracking-wide px-6 py-3 ${
                  active ? "text-amber" : "text-white hover:text-amber"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href={site.contact.phoneHref}
            className="mt-6 flex items-center gap-2 text-white text-xl font-display font-semibold"
          >
            <IconPhone className="w-6 h-6 text-amber" />
            {site.contact.phoneDisplay}
          </a>
          <Link
            href="/contact"
            className="mt-5 font-display uppercase text-sm font-semibold tracking-[0.1em] bg-amber text-white px-8 py-4"
          >
            Free Inspection
          </Link>
        </nav>
      </div>
    </header>
  );
}
