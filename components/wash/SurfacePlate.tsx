"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * A material sample that washes clean along a wet diagonal edge.
 *
 * The surfaces are drawn rather than photographed. A pressure washing site is
 * usually a wall of other people's stock driveways; drawing them keeps every
 * sample honest, keeps the page weightless, and lets the material itself —
 * bond pattern, board grain, broom finish — carry the art direction.
 */

export type SurfaceKind =
  | "concrete"
  | "brick"
  | "deck"
  | "pavers"
  | "siding"
  | "roof";

const kindLabel: Record<SurfaceKind, string> = {
  concrete: "Broom-finished concrete",
  brick: "Brick in running bond",
  deck: "Cedar decking",
  pavers: "Clay paver patio",
  siding: "Lap siding",
  roof: "Asphalt shingle",
};

function Material({ kind, id }: { kind: SurfaceKind; id: string }) {
  switch (kind) {
    case "brick":
      return (
        <>
          <rect width="400" height="260" fill="#a9705c" />
          <g fill="#b87d66">
            {Array.from({ length: 9 }).map((_, row) =>
              Array.from({ length: 7 }).map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={col * 60 + (row % 2 ? -30 : 0)}
                  y={row * 30}
                  width="55"
                  height="25"
                  rx="1.5"
                  opacity={0.72 + ((row * 7 + col) % 5) * 0.06}
                />
              )),
            )}
          </g>
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.35"
          />
        </>
      );
    case "deck":
      return (
        <>
          <rect width="400" height="260" fill="#b5946c" />
          <g>
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={i}>
                <rect
                  x="0"
                  y={i * 33 + 2}
                  width="400"
                  height="29"
                  fill="#c2a077"
                  opacity={0.7 + (i % 3) * 0.1}
                />
                <path
                  d={`M0 ${i * 33 + 14} q 100 ${i % 2 ? 4 : -4} 200 0 t 200 0`}
                  stroke="#9c7c55"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.55"
                />
                <circle cx="26" cy={i * 33 + 16} r="1.8" fill="#8a6c4a" />
                <circle cx="374" cy={i * 33 + 16} r="1.8" fill="#8a6c4a" />
              </g>
            ))}
          </g>
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.28"
          />
        </>
      );
    case "pavers":
      return (
        <>
          <rect width="400" height="260" fill="#b9ad99" />
          <g fill="#cfc4b0">
            {Array.from({ length: 7 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => (
                <g key={`${row}-${col}`}>
                  <rect
                    x={col * 80 + (row % 2 ? 0 : 40)}
                    y={row * 38}
                    width="36"
                    height="34"
                    rx="2"
                    opacity={0.75 + ((row + col) % 4) * 0.06}
                  />
                  <rect
                    x={col * 80 + (row % 2 ? 40 : 0)}
                    y={row * 38}
                    width="36"
                    height="34"
                    rx="2"
                    opacity={0.68 + ((row * 3 + col) % 4) * 0.07}
                  />
                </g>
              )),
            )}
          </g>
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.3"
          />
        </>
      );
    case "siding":
      return (
        <>
          <rect width="400" height="260" fill="#cbc7bb" />
          {Array.from({ length: 11 }).map((_, i) => (
            <g key={i}>
              <rect x="0" y={i * 24} width="400" height="21" fill="#dedbd1" />
              <rect
                x="0"
                y={i * 24 + 19}
                width="400"
                height="5"
                fill="#a8a496"
              />
            </g>
          ))}
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.2"
          />
        </>
      );
    case "roof":
      return (
        <>
          <rect width="400" height="260" fill="#767d84" />
          {/* Shingle courses: wide tabs and the shadow line under each course,
              which is what actually reads as a roof rather than a wall. */}
          {Array.from({ length: 11 }).map((_, row) => (
            <g key={row}>
              {Array.from({ length: 7 }).map((_, col) => (
                <rect
                  key={col}
                  x={col * 68 + (row % 2 ? -34 : 0)}
                  y={row * 25}
                  width="66"
                  height="24"
                  fill="#8a9198"
                  opacity={0.68 + ((row * 5 + col * 3) % 6) * 0.055}
                />
              ))}
              <rect
                x="0"
                y={row * 25 + 20}
                width="400"
                height="5"
                fill="#5c636a"
                opacity="0.85"
              />
            </g>
          ))}
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.55"
          />
        </>
      );
    case "concrete":
    default:
      return (
        <>
          <rect width="400" height="260" fill="#b5b1a3" />
          {/* broom finish — the fine parallel drag of the bristles */}
          <g stroke="#9d9889" strokeWidth="1.2" opacity="0.8">
            {Array.from({ length: 52 }).map((_, i) => (
              <path
                key={i}
                d={`M${i * 8} 0 q 3 130 0 260`}
                fill="none"
                opacity={0.35 + ((i * 7) % 10) * 0.07}
              />
            ))}
          </g>
          {/* aggregate showing through the paste */}
          <g fill="#8e897a" opacity="0.5">
            {Array.from({ length: 90 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 61) % 400}
                cy={(i * 97) % 260}
                r={0.9 + ((i * 13) % 5) * 0.35}
              />
            ))}
          </g>
          {/* control joints */}
          <g stroke="#87826f" strokeWidth="2.6">
            <path d="M133 0 V260" />
            <path d="M267 0 V260" />
            <path d="M0 130 H400" />
          </g>
          <rect
            width="400"
            height="260"
            fill={`url(#${id}-grit)`}
            opacity="0.5"
          />
        </>
      );
  }
}

export default function SurfacePlate({
  kind = "concrete",
  caption,
  note,
  delay = 0,
  className = "",
}: {
  kind?: SurfaceKind;
  caption?: string;
  note?: string;
  delay?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [washed, setWashed] = useState(false);

  // Wash themselves once on the way past, then stay under the reader's control.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(() => setWashed(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [delay]);

  const soilClip = washed
    ? "polygon(-12% 0, -2% 0, -12% 100%, -12% 100%)"
    : "polygon(-12% 0, 114% 0, 104% 100%, -12% 100%)";

  return (
    <figure ref={ref} className={className}>
      <button
        type="button"
        onClick={() => setWashed((w) => !w)}
        aria-pressed={washed}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-lg bg-chalk-3 ring-1 ring-prussian/10 transition-shadow duration-300 hover:ring-prussian/25"
      >
        <span className="sr-only">
          {washed ? "Show" : "Wash"} the {kindLabel[kind].toLowerCase()} sample
        </span>

        <div className="relative aspect-[400/260] w-full">
          <svg
            viewBox="0 0 400 260"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <filter id={`${id}-noise`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="3"
                />
              </filter>
              <pattern
                id={`${id}-grit`}
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <rect width="120" height="120" filter={`url(#${id}-noise)`} />
              </pattern>
            </defs>
            <Material kind={kind} id={id} />
          </svg>

          {/* the soiled film, wiped away along a diagonal */}
          <div
            className="plate-soil absolute inset-0"
            style={{ clipPath: soilClip }}
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background:
                  "radial-gradient(70% 90% at 18% 22%, #59614166 0%, transparent 60%)," +
                  "radial-gradient(80% 70% at 78% 74%, #3f453166 0%, transparent 62%)," +
                  "radial-gradient(60% 60% at 46% 90%, #4b503a80 0%, transparent 58%)," +
                  "linear-gradient(180deg, #6d7154cc 0%, #4c5040e6 100%)",
              }}
            />
          </div>

          {/* the wet line the water leaves as it moves across */}
          <div
            className="plate-edge pointer-events-none absolute inset-y-0 left-0 w-full"
            style={{ transform: `translateX(${washed ? -103 : 7}%)` }}
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-r from-transparent via-spray-lit/50 to-chalk/70" />
          </div>
        </div>
      </button>

      {(caption || note) && (
        <figcaption className="mt-4">
          {caption && (
            <p className="font-display text-[1.05rem] font-semibold text-prussian">
              {caption}
            </p>
          )}
          {note && <p className="mt-1.5 text-[0.9375rem] text-stone">{note}</p>}
          <p className="spec mt-2.5 text-stone/70">
            {washed ? "Washed — tap to soil again" : "Tap to wash"}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
