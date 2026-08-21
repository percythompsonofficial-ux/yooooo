"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

const links = [
  { href: "/songy", label: "Home" },
  { href: "/songy/services", label: "Services" },
  { href: "/songy/portfolio", label: "Our Work" },
  { href: "/songy/about", label: "About" },
  { href: "/songy/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-pine/90 backdrop-blur-md border-b border-ivory/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between h-20">
        <Link
          href="/songy"
          className="text-ivory hover:text-brass transition-colors duration-200"
          aria-label="Songy Brothers Lawn & Landscape — home"
        >
          <Wordmark />
        </Link>

        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex items-center gap-9">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[0.78rem] uppercase tracking-[0.22em] transition-colors duration-200 pb-1 border-b ${
                      active
                        ? "text-brass border-brass"
                        : "text-ivory/80 border-transparent hover:text-ivory hover:border-ivory/40"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/songy/contact"
                className="text-[0.78rem] uppercase tracking-[0.22em] text-pine bg-brass hover:bg-ivory transition-colors duration-200 px-5 py-3"
              >
                Free Estimate
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="lg:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[7px] text-ivory cursor-pointer"
        >
          <span
            className={`block w-7 h-px bg-current transition-transform duration-300 ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-7 h-px bg-current transition-transform duration-300 ${
              open ? "-translate-y-[4px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 top-20 bg-pine/97 backdrop-blur-lg transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav aria-label="Mobile" className="h-full overflow-y-auto">
          <ul className="flex flex-col items-center justify-center gap-2 py-16 min-h-full">
            {links.map((l, i) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li
                  key={l.href}
                  className={`transition-all duration-500 ${
                    open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                  style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                >
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`font-display text-4xl px-6 py-3 inline-block transition-colors ${
                      active ? "text-brass" : "text-ivory hover:text-brass"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li
              className={`mt-6 transition-all duration-500 ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: open ? "400ms" : "0ms" }}
            >
              <Link
                href="/songy/contact"
                className="text-sm uppercase tracking-[0.22em] text-pine bg-brass px-8 py-4 inline-block"
              >
                Free Estimate
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
