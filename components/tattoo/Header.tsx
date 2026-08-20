"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/tattoo-site";
import Logo from "./Logo";

const links = [
  { href: "/tattoo", label: "Home" },
  { href: "/tattoo/work", label: "Work" },
  { href: "/tattoo/artists", label: "The Artist" },
  { href: "/tattoo/booking", label: "Booking" },
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
          ? "bg-void/90 backdrop-blur-md border-b border-salt/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between h-20">
        <Link
          href="/tattoo"
          className="flex items-center gap-2.5 text-salt hover:text-volt transition-colors duration-200"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const active =
              l.href === "/tattoo" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`font-mono text-[0.7rem] uppercase tracking-[0.24em] transition-colors duration-200 ${
                  active ? "text-volt" : "text-salt/80 hover:text-volt"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.7rem] uppercase tracking-[0.24em] bg-volt text-void px-5 py-3 hover:bg-salt transition-colors duration-200"
          >
            DM to book
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="tattoo-mobile-nav"
          className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 items-center text-salt cursor-pointer"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "translate-y-1 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "-translate-y-1 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav
          id="tattoo-mobile-nav"
          aria-label="Main"
          className="md:hidden fixed inset-0 top-20 bg-void/95 backdrop-blur-md px-6 py-10 flex flex-col gap-2"
        >
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display font-extrabold uppercase text-4xl py-3 text-salt hover:text-volt transition-colors duration-200 border-b border-salt/10"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 font-mono text-xs uppercase tracking-[0.24em] bg-volt text-void px-6 py-4 text-center"
          >
            DM to book
          </a>
        </nav>
      )}
    </header>
  );
}
