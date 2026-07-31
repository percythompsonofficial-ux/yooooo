"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui";
import { IconPhone, IconArrow } from "./icons";
import { site } from "@/lib/wash-site";

/**
 * The hero is the job. A grime layer sits on a canvas over clean wet stone,
 * and the pointer erases it exactly the way a surface cleaner does — so the
 * headline's claim is demonstrated rather than asserted.
 *
 * Coverage is tracked on a coarse occupancy grid rather than by reading pixels
 * back, which keeps the readout live without touching getImageData per frame.
 */

const BRUSH = 82; // css px, radius of the wand's effective path
const GRID_X = 44;
const GRID_Y = 26;

export default function WashHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gridRef = useRef<Uint8Array>(new Uint8Array(GRID_X * GRID_Y));
  const clearedRef = useRef(0);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [pct, setPct] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const reduced = useRef(false);

  /** Lay down the soiled film: base grime, organic blotching, runoff streaks. */
  const paintGrime = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#6d6e57";
      ctx.fillRect(0, 0, w, h);

      // algae and salt bloom, thicker where water sits
      const tones = [
        "#7d8260",
        "#545942",
        "#787a63",
        "#8b8f66",
        "#4b5040",
        "#8a866c",
      ];
      for (let i = 0; i < 170; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 40 + Math.random() * 230;
        const tone = tones[i % tones.length];
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `${tone}bb`);
        g.addColorStop(1, `${tone}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // runoff and tyre film — long horizontal drift
      ctx.save();
      for (let i = 0; i < 26; i++) {
        const y = Math.random() * h;
        const len = w * (0.25 + Math.random() * 0.7);
        const x = Math.random() * w - len * 0.3;
        const thick = 8 + Math.random() * 46;
        const g = ctx.createLinearGradient(x, y, x + len, y);
        g.addColorStop(0, "#3d412f00");
        g.addColorStop(0.5, "#3d412f66");
        g.addColorStop(1, "#3d412f00");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, len, thick);
      }
      ctx.restore();

      // fine dry speckle
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = i % 3 === 0 ? "#a8ab8c" : "#3a3e30";
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    },
    [],
  );

  const markGrid = useCallback((x: number, y: number, r: number) => {
    const { w, h } = sizeRef.current;
    if (!w || !h) return;
    const cw = w / GRID_X;
    const ch = h / GRID_Y;
    const x0 = Math.max(0, Math.floor((x - r) / cw));
    const x1 = Math.min(GRID_X - 1, Math.floor((x + r) / cw));
    const y0 = Math.max(0, Math.floor((y - r) / ch));
    const y1 = Math.min(GRID_Y - 1, Math.floor((y + r) / ch));
    const grid = gridRef.current;
    let added = 0;
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const idx = gy * GRID_X + gx;
        if (!grid[idx]) {
          grid[idx] = 1;
          added++;
        }
      }
    }
    if (added) {
      clearedRef.current += added;
      setPct(
        Math.min(100, Math.round((clearedRef.current / grid.length) * 100)),
      );
    }
  }, []);

  const erase = useCallback(
    (x: number, y: number, r = BRUSH) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, r * 0.34, x, y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.62, "rgba(0,0,0,0.72)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      markGrid(x, y, r * 0.7);
    },
    [markGrid],
  );

  /** Draw along the segment so a fast flick still leaves a continuous pass. */
  const eraseTo = useCallback(
    (x: number, y: number) => {
      const last = lastRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(48, Math.ceil(dist / (BRUSH * 0.34)));
        for (let i = 1; i <= steps; i++) {
          erase(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
      }
      erase(x, y);
      lastRef.current = { x, y };
    },
    [erase],
  );

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
    sizeRef.current = { w: rect.width, h: rect.height };

    gridRef.current = new Uint8Array(GRID_X * GRID_Y);
    clearedRef.current = 0;
    setPct(0);
    lastRef.current = null;
    paintGrime(ctx, rect.width, rect.height);
  }, [paintGrime]);

  /** One demonstration pass on load, so nobody has to be told what to do. */
  const sweep = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (!w || !h) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (reduced.current) {
      for (let x = -0.1; x < 1.15; x += 0.02) {
        erase(x * w, h * 0.56, BRUSH * 1.5);
      }
      return;
    }

    const start = performance.now();
    const dur = 1500;
    lastRef.current = null;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 2.4);
      const x = (-0.12 + eased * 1.28) * w;
      const y = h * (0.58 + Math.sin(eased * Math.PI * 1.6) * 0.11);
      eraseTo(x, y);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        lastRef.current = null;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [erase, eraseTo]);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    init();
    const t = window.setTimeout(sweep, 520);

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
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    }
    if (e.pointerType === "touch" && e.buttons === 0) {
      // let a plain scroll gesture through untouched
    }
    setCursor({ x, y });
    if (!touched) setTouched(true);
    eraseTo(x, y);
  };

  const onPointerLeave = () => {
    setCursor(null);
    lastRef.current = null;
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
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerMove}
      >
        {/* clean, wet, saturated stone — what the wand uncovers */}
        <div className="wash-clean absolute inset-0" aria-hidden="true" />
        <div className="wash-prism absolute inset-0" aria-hidden="true" />

        {/* the soiled film */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        <div className="wash-scrim absolute inset-0" aria-hidden="true" />

        {/* the wand's disc, drawn where the real cursor would be */}
        {cursor && (
          <div
            className="pointer-events-none absolute z-20 hidden md:block"
            style={{ left: cursor.x, top: cursor.y }}
            aria-hidden="true"
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div className="w-[92px] h-[92px] rounded-full border border-spray-lit/50" />
              <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-spray-lit" />
            </div>
            <span
              className={`spec absolute top-8 whitespace-nowrap text-spray-lit/90 ${
                cursor.x > sizeRef.current.w - 220
                  ? "right-14 text-right"
                  : "left-14"
              }`}
            >
              25° · 3,200 PSI
            </span>
          </div>
        )}

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
              The gray you&rsquo;re looking at
              <br className="hidden sm:block" />{" "}
              <span className="text-spray-lit">isn&rsquo;t concrete.</span>
            </h1>

            <p
              className="animate-fade-up mt-7 max-w-[46ch] text-lg leading-relaxed text-chalk/85"
              style={{ animationDelay: "0.12s" }}
            >
              It&rsquo;s five years of salt air, algae and tyre film sitting on
              top of it. We take that off — at the pressure the surface can
              actually take, and not a pound more.
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4"
              style={{ animationDelay: "0.24s" }}
            >
              <Button href="/wash/contact">
                Get a free surface quote{" "}
                <IconArrow className="w-[18px] h-[18px]" />
              </Button>
              <Button href={site.contact.phoneHref} variant="outline" external>
                <IconPhone className="w-[18px] h-[18px]" />
                {site.contact.phoneDisplay}
              </Button>
            </div>
          </div>

          {/* live readout — the surface's own status line */}
          <div className="wash-readout mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-chalk/15 pt-5">
            <p className="spec text-chalk/70" aria-live="off">
              Surface restored{" "}
              <span className="text-spray-lit">
                {String(pct).padStart(2, "0")}%
              </span>
            </p>
            <p className="spec text-chalk/45">
              <span className="md:hidden">
                Drag across the surface to wash it
              </span>
              <span className="hidden md:inline">
                {touched
                  ? "Keep going — it all comes off"
                  : "Move your cursor across the surface"}
              </span>
            </p>
            <button
              type="button"
              onClick={sweep}
              className="spec cursor-pointer rounded-full border border-chalk/25 px-4 py-2 text-chalk/70 transition-colors duration-200 hover:border-spray-lit hover:text-spray-lit"
            >
              Run a pass
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
