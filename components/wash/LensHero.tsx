"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui";
import { IconPhone, IconArrow } from "./icons";
import { site } from "@/lib/wash-site";

/**
 * The hero reframes the job: the film on a roof or slab is not dirt, it is a
 * living colony. A lens follows the pointer and magnifies what is actually
 * growing there, which is the whole argument for treating a surface rather
 * than blasting it.
 *
 * The colony is generated from a hash of world coordinates rather than a
 * stored particle list, so the field is continuous — moving the lens explores
 * one surface instead of reshuffling random blobs — at a fixed cost per frame.
 */

const LENS_WIDE = 78; // css px radius on desktop
const LENS_NARROW = 54; // smaller on phones, where it has copy to share space with
const ZOOM = 7;
const CELL = 1.9; // world px between colony cells

/** Deterministic value hash — same grid coordinate always yields the same cell. */
function hash(x: number, y: number, salt = 0) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + salt * 144665633;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export default function LensHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [moved, setMoved] = useState(false);
  const [lensR, setLensR] = useState(LENS_WIDE);
  const lensRRef = useRef(LENS_WIDE);
  const reduced = useRef(false);

  /** The soiled surface: dark organic film with the vertical streaking a roof gets. */
  const paintFilm = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#3b4534";
      ctx.fillRect(0, 0, w, h);

      const tones = ["#4a5740", "#2b3527", "#556343", "#333d2e", "#414f38"];
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 50 + Math.random() * 260;
        const tone = tones[i % tones.length];
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `${tone}cc`);
        g.addColorStop(1, `${tone}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // the streaking that runs down a north-facing roof
      for (let i = 0; i < 46; i++) {
        const x = Math.random() * w;
        const top = Math.random() * h * 0.5;
        const len = h * (0.3 + Math.random() * 0.7);
        const wide = 10 + Math.random() * 60;
        const g = ctx.createLinearGradient(x, top, x, top + len);
        g.addColorStop(0, "#12180f00");
        g.addColorStop(0.45, "#12180f66");
        g.addColorStop(1, "#12180f00");
        ctx.fillStyle = g;
        ctx.fillRect(x, top, wide, len);
      }

      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = i % 3 === 0 ? "#8b9877" : "#1d2418";
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    },
    [],
  );

  /** Draw the colony inside the lens, in world space so the field stays continuous. */
  const paintLens = useCallback((cx: number, cy: number) => {
    const canvas = lensRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const R = lensRRef.current;
    const d = R * 2;

    ctx.clearRect(0, 0, d, d);
    ctx.fillStyle = "#39422f";
    ctx.fillRect(0, 0, d, d);

    const reach = R / ZOOM + CELL * 2;
    const gx0 = Math.floor((cx - reach) / CELL);
    const gx1 = Math.ceil((cx + reach) / CELL);
    const gy0 = Math.floor((cy - reach) / CELL);
    const gy1 = Math.ceil((cy + reach) / CELL);

    const greens = ["#2f7d4e", "#3f9a5f", "#245f3c", "#57b073", "#1d5133"];
    const grains = ["#8d8b76", "#6f6d5c", "#a3a08a"];

    for (let gy = gy0; gy <= gy1; gy++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        const jx = (gx + (hash(gx, gy, 1) - 0.5) * 0.9) * CELL;
        const jy = (gy + (hash(gx, gy, 2) - 0.5) * 0.9) * CELL;
        const sx = R + (jx - cx) * ZOOM;
        const sy = R + (jy - cy) * ZOOM;
        if (sx < -20 || sx > d + 20 || sy < -20 || sy > d + 20) continue;

        const kind = hash(gx, gy, 3);
        const r = (0.28 + hash(gx, gy, 4) * 0.62) * CELL * ZOOM * 0.5;

        if (kind > 0.8) {
          // mineral grain in the surface itself, showing between the growth
          ctx.fillStyle = grains[Math.floor(hash(gx, gy, 5) * grains.length)];
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const tone = greens[Math.floor(hash(gx, gy, 6) * greens.length)];
          ctx.globalAlpha = 0.55 + hash(gx, gy, 7) * 0.45;
          ctx.fillStyle = tone;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
          // the dark side of each cell, which is what reads as "alive"
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = "#0b1c26";
          ctx.beginPath();
          ctx.arc(sx + r * 0.36, sy + r * 0.36, r * 0.52, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  const init = useCallback(() => {
    const wrap = wrapRef.current;
    const film = filmRef.current;
    const lens = lensRef.current;
    if (!wrap || !film || !lens) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    film.width = Math.round(rect.width * dpr);
    film.height = Math.round(rect.height * dpr);
    const ctx = film.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = { w: rect.width, h: rect.height };
    paintFilm(ctx, rect.width, rect.height);

    const R = rect.width < 640 ? LENS_NARROW : LENS_WIDE;
    lensRRef.current = R;
    setLensR(R);
    lens.width = R * 2 * dpr;
    lens.height = R * 2 * dpr;
    lens.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [paintFilm]);

  /** Drift the lens across once so the interaction explains itself. */
  const sweep = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (!w || !h) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // On a phone the copy spans the full width, so the lens rides the empty
    // band above the headline instead of parking on top of the sentence.
    const narrow = w < 640;
    const band = narrow ? 0.19 : 0.5;

    if (reduced.current) {
      const p = { x: w * (narrow ? 0.72 : 0.62), y: h * band };
      setPos(p);
      paintLens(p.x, p.y);
      return;
    }

    const start = performance.now();
    const dur = 2400;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = w * (narrow ? 0.52 + eased * 0.3 : 0.3 + eased * 0.42);
      const y =
        h * (band + Math.sin(eased * Math.PI * 1.4) * (narrow ? 0.035 : 0.12));
      setPos({ x, y });
      paintLens(x, y);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
  }, [paintLens]);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    init();
    const t = window.setTimeout(sweep, 620);

    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        init();
        sweep();
      }, 220);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [init, sweep]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({ x, y });
    paintLens(x, y);
    if (!moved) setMoved(true);
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-prussian text-chalk"
      aria-labelledby="wash-hero-title"
    >
      <div
        ref={wrapRef}
        className="wash-surface relative min-h-[clamp(560px,84svh,860px)] touch-pan-y"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
      >
        <canvas
          ref={filmRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        <div className="wash-scrim absolute inset-0" aria-hidden="true" />

        {/* the lens */}
        <div
          className={`pointer-events-none absolute z-20 transition-opacity duration-300 ${
            pos ? "opacity-100" : "opacity-0"
          }`}
          style={{ left: pos?.x ?? 0, top: pos?.y ?? 0 }}
          aria-hidden="true"
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div
              className="overflow-hidden rounded-full ring-2 ring-spray-lit/80 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              style={{ width: lensR * 2, height: lensR * 2 }}
            >
              <canvas
                ref={lensRef}
                style={{ width: lensR * 2, height: lensR * 2 }}
              />
            </div>
          </div>
          <span
            className="spec absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-spray-lit/90"
            style={{ top: lensR + 12 }}
          >
            ×{ZOOM}
            <span className="hidden sm:inline"> · gloeocapsa magma</span>
          </span>
        </div>

        {/* content */}
        <div className="relative z-10 mx-auto flex min-h-[clamp(560px,84svh,860px)] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <div className="max-w-3xl">
            <p className="spec animate-fade-in text-spray-lit">
              Surface restoration — Gulf Coast, MS
            </p>

            <h1
              id="wash-hero-title"
              className="animate-fade-up mt-6 font-display text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-balance"
            >
              That&rsquo;s not dirt.
              <br className="hidden sm:block" />{" "}
              <span className="text-spray-lit">It&rsquo;s alive.</span>
            </h1>

            <p
              className="animate-fade-up mt-7 max-w-[48ch] text-lg leading-relaxed text-chalk/85"
              style={{ animationDelay: "0.12s" }}
            >
              The black streaking on your roof and the green film on your slab
              are colonies of algae feeding on the surface. Blasting them just
              moves them around. We kill them first, then rinse.
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4"
              style={{ animationDelay: "0.24s" }}
            >
              <Button href="/wash/contact">
                Get a free surface quote{" "}
                <IconArrow className="h-[18px] w-[18px]" />
              </Button>
              <Button href={site.contact.phoneHref} variant="outline" external>
                <IconPhone className="h-[18px] w-[18px]" />
                {site.contact.phoneDisplay}
              </Button>
            </div>
          </div>

          <div className="wash-readout mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-chalk/15 pt-5">
            <p className="spec text-chalk/70">
              Under the lens <span className="text-spray-lit">×{ZOOM}</span>
            </p>
            <p className="spec text-chalk/45">
              <span className="md:hidden">Drag across the surface</span>
              <span className="hidden md:inline">
                {moved
                  ? "Every one of those cells is living"
                  : "Move your cursor across the surface"}
              </span>
            </p>
            <button
              type="button"
              onClick={sweep}
              className="spec cursor-pointer rounded-full border border-chalk/25 px-4 py-2 text-chalk/70 transition-colors duration-200 hover:border-spray-lit hover:text-spray-lit"
            >
              Look closer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
