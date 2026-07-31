"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { IconPhone } from "./icons";
import { site } from "@/lib/wash-site";

const links = [
  { href: "/wash", label: "Home" },
  { href: "/wash/services", label: "Services" },
  { href: "/wash/work", label: "Surfaces" },
  { href: "/wash/about", label: "About" },
  { href: "/wash/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();

  // Every page opens on a dark hero, so the bar rides transparent and light
  // until it lifts off the top, then flips to the chalk ground.
  const solid = lifted || open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid
            ? "border-b border-prussian/10 bg-chalk/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/wash" aria-label="Saltline Surface Co. — home">
            <Logo dark={!solid} />
          </Link>

          <nav
            className="hidden items-center gap-9 lg:flex"
            aria-label="Primary"
          >
            {links.map((l) => {
              const active =
                l.href === "/wash"
                  ? pathname === "/wash"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[0.9375rem] font-medium transition-colors duration-200 ${
                    active
                      ? solid
                        ? "text-spray-ink"
                        : "text-spray-lit"
                      : solid
                        ? "text-prussian/70 hover:text-prussian"
                        : "text-chalk/75 hover:text-chalk"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <a
              href={site.contact.phoneHref}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                solid
                  ? "text-prussian hover:text-spray-ink"
                  : "text-chalk hover:text-spray-lit"
              }`}
            >
              <IconPhone
                className={`h-[18px] w-[18px] ${solid ? "text-spray" : "text-spray-lit"}`}
              />
              <span className="font-display font-semibold tracking-[-0.01em]">
                {site.contact.phoneDisplay}
              </span>
            </a>
            <Link
              href="/wash/contact"
              className={`rounded-full px-6 py-3 font-display text-[0.9rem] font-semibold transition-colors duration-200 ${
                solid
                  ? "bg-prussian text-chalk hover:bg-spray hover:text-prussian"
                  : "bg-chalk text-prussian hover:bg-spray-lit"
              }`}
            >
              Free quote
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="wash-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`relative flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[7px] lg:hidden ${
              solid ? "text-prussian" : "text-chalk"
            }`}
          >
            <span
              className={`block h-0.5 w-7 bg-current transition-transform duration-300 ${
                open ? "translate-y-[4.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-7 bg-current transition-transform duration-300 ${
                open ? "-translate-y-[4.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Sibling of the header, not a child: the bar's backdrop-blur would
          otherwise become the containing block and trap this panel inside it. */}
      <div
        id="wash-menu"
        className={`fixed inset-0 top-[76px] z-40 bg-chalk transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col items-start overflow-y-auto px-6 py-8"
        >
          {links.map((l) => {
            const active =
              l.href === "/wash"
                ? pathname === "/wash"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`w-full border-b border-prussian/10 py-5 font-display text-[1.9rem] font-semibold tracking-[-0.03em] ${
                  active ? "text-spray-ink" : "text-prussian"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href={site.contact.phoneHref}
            className="mt-9 flex items-center gap-3 font-display text-xl font-semibold text-prussian"
          >
            <IconPhone className="h-5 w-5 text-spray" />
            {site.contact.phoneDisplay}
          </a>
          <Link
            href="/wash/contact"
            className="mt-6 rounded-full bg-prussian px-8 py-4 font-display font-semibold text-chalk"
          >
            Get a free quote
          </Link>
        </nav>
      </div>
    </>
  );
}
