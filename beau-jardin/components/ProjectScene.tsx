/* Painted SVG scenes for portfolio pieces — each project gets its own composition. */

export type SceneVariant =
  | "allee"
  | "parterre"
  | "coastal"
  | "evening"
  | "poolside"
  | "cottage";

function Allee({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8ddd0" />
          <stop offset="1" stopColor="#aebaa8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-sky)`} />
      <rect y="380" width="800" height="220" fill="#5c7358" />
      {/* drive converging to mist */}
      <path d="M330 600 L392 380 L408 380 L470 600 Z" fill="#cfc9b4" />
      {/* oak rows */}
      {[0, 1, 2, 3, 4].map((i) => {
        const t = i / 4;
        const s = 1 - t * 0.72;
        const y = 600 - t * 200;
        const o = 1 - t * 0.55;
        return (
          <g key={i} opacity={o}>
            <g transform={`translate(${180 - t * -130} ${y}) scale(${s})`}>
              <path d="M-8 0 C-10 -60 -18 -100 -34 -130 L-20 -136 C-6 -104 0 -64 6 0 Z" fill="#2c3b2c" />
              <ellipse cx="-30" cy="-160" rx="95" ry="52" fill="#33452f" />
            </g>
            <g transform={`translate(${620 + t * -130} ${y}) scale(${s})`}>
              <path d="M-6 0 C-4 -60 4 -100 22 -130 L10 -138 C-6 -104 -12 -64 -14 0 Z" fill="#2c3b2c" />
              <ellipse cx="24" cy="-160" rx="95" ry="52" fill="#31432d" />
            </g>
          </g>
        );
      })}
      <rect y="290" width="800" height="120" fill="#d8ddd0" opacity="0.35" />
    </>
  );
}

function Parterre({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-lawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#77896d" />
          <stop offset="1" stopColor="#5b7156" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-lawn)`} />
      <rect x="60" y="50" width="680" height="500" fill="none" stroke="#e8e2cf" strokeWidth="3" opacity="0.7" />
      <rect x="82" y="72" width="636" height="456" fill="none" stroke="#e8e2cf" strokeWidth="1.5" opacity="0.5" />
      {/* four formal beds */}
      {[
        [110, 100],
        [430, 100],
        [110, 330],
        [430, 330],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="260" height="170" fill="#425640" />
          <rect x={x + 14} y={y + 14} width="232" height="142" fill="#4f6549" />
          <circle cx={x + 130} cy={y + 85} r="34" fill="#3a4e39" />
          <circle cx={x + 130} cy={y + 85} r="14" fill="#c9a86a" opacity="0.85" />
        </g>
      ))}
      {/* central fountain */}
      <circle cx="400" cy="300" r="64" fill="#e8e2cf" />
      <circle cx="400" cy="300" r="50" fill="#9db4b0" />
      <circle cx="400" cy="300" r="16" fill="#e8e2cf" />
      <path d="M400 268 v-20" stroke="#e8e2cf" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function Coastal({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e2d3" />
          <stop offset="1" stopColor="#c2ccc0" />
        </linearGradient>
        <linearGradient id={`${p}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93aaa5" />
          <stop offset="1" stopColor="#7e988f" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-sky)`} />
      <rect y="252" width="800" height="90" fill={`url(#${p}-sea)`} />
      <path d="M0 342 C240 322 560 322 800 342 L800 600 L0 600 Z" fill="#6d8263" />
      <path d="M0 430 C260 408 540 408 800 430 L800 600 L0 600 Z" fill="#5c7358" />
      {/* meandering path */}
      <path d="M370 600 C420 520 340 470 420 400 C460 360 500 350 560 344" stroke="#d6cfb8" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.9" />
      {/* sea oats clumps */}
      {[
        [120, 560],
        [205, 590],
        [660, 545],
        [730, 585],
      ].map(([x, y], i) => (
        <g key={i} stroke="#c9b989" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d={`M${x} ${y} C${x - 6} ${y - 40} ${x - 18} ${y - 58} ${x - 30} ${y - 68}`} />
          <path d={`M${x} ${y} C${x} ${y - 48} ${x - 4} ${y - 66} ${x} ${y - 84}`} />
          <path d={`M${x} ${y} C${x + 6} ${y - 40} ${x + 18} ${y - 58} ${x + 32} ${y - 64}`} />
        </g>
      ))}
      <circle cx="620" cy="120" r="46" fill="#efe9d2" opacity="0.85" />
    </>
  );
}

function Evening({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3a40" />
          <stop offset="0.55" stopColor="#243228" />
          <stop offset="1" stopColor="#131f16" />
        </linearGradient>
        <radialGradient id={`${p}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9c477" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e9c477" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-dusk)`} />
      <ellipse cx="150" cy="240" rx="150" ry="90" fill="#1a271c" />
      <ellipse cx="660" cy="210" rx="170" ry="100" fill="#182518" />
      <rect y="430" width="800" height="170" fill="#10190f" />
      <path d="M320 600 L380 430 L420 430 L480 600 Z" fill="#2c2a20" />
      {/* lantern glows along path */}
      {[
        [300, 445],
        [510, 452],
        [255, 505],
        [560, 515],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y - 28} r="52" fill={`url(#${p}-glow)`} />
          <rect x={x - 2.5} y={y - 30} width="5" height="34" fill="#453d2b" />
          <circle cx={x} cy={y - 32} r="7" fill="#f2d791" />
        </g>
      ))}
      {/* fireflies */}
      {[
        [130, 330],
        [210, 285],
        [640, 320],
        [700, 370],
        [420, 250],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#f2d791" opacity="0.8" />
      ))}
    </>
  );
}

function Poolside({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a7c0bb" />
          <stop offset="1" stopColor="#7fa19b" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#dcd6c2" />
      <rect x="0" y="0" width="800" height="150" fill="#4d6349" />
      <rect x="0" y="150" width="800" height="14" fill="#3c4f3a" />
      {/* reflecting pool */}
      <rect x="140" y="230" width="520" height="280" fill={`url(#${p}-water)`} />
      <rect x="140" y="230" width="520" height="280" fill="none" stroke="#efe9d2" strokeWidth="10" />
      {/* reflected canopy */}
      <ellipse cx="270" cy="300" rx="110" ry="38" fill="#5d7561" opacity="0.5" />
      <ellipse cx="560" cy="330" rx="90" ry="30" fill="#5d7561" opacity="0.4" />
      <path d="M160 420 h480" stroke="#efe9d2" strokeWidth="2" opacity="0.35" />
      {/* clipped hedge spheres */}
      {[110, 250, 400, 550, 690].map((x, i) => (
        <circle key={i} cx={x} cy={185} r={i % 2 ? 26 : 34} fill="#41563f" />
      ))}
      {/* stone pavers */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={190 + i * 115} y={545} width="90" height="26" rx="3" fill="#c9c2aa" />
      ))}
    </>
  );
}

function Cottage({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7e3d2" />
          <stop offset="1" stopColor="#cdd2bd" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-sky)`} />
      <path d="M0 300 C260 270 540 270 800 300 L800 600 L0 600 Z" fill="#67805f" />
      {/* curving walk */}
      <path d="M100 600 C240 520 420 540 520 460 C600 400 640 360 660 300" stroke="#d9d2ba" strokeWidth="34" fill="none" strokeLinecap="round" />
      {/* layered borders with bloom dots */}
      <ellipse cx="180" cy="420" rx="130" ry="56" fill="#4c6347" />
      <ellipse cx="600" cy="500" rx="160" ry="64" fill="#465e42" />
      <ellipse cx="420" cy="330" rx="110" ry="44" fill="#54704e" />
      {(
        [
          [130, 400, "#d9a8b4"],
          [200, 438, "#e5d08e"],
          [245, 408, "#d9a8b4"],
          [560, 480, "#c48fa0"],
          [630, 516, "#e5d08e"],
          [680, 486, "#d9a8b4"],
          [390, 318, "#e5d08e"],
          [455, 342, "#c48fa0"],
        ] as const
      ).map(([x, y, c], i) => (
        <g key={i} fill={c}>
          <circle cx={x} cy={y} r="7" />
          <circle cx={x + 14} cy={y + 6} r="5" />
          <circle cx={x - 12} cy={y + 8} r="5" />
        </g>
      ))}
      {/* arbor */}
      <path d="M620 300 a46 46 0 0 1 92 0 V380 h-10 V304 a36 36 0 0 0 -72 0 V380 h-10 Z" fill="#efe9d2" />
    </>
  );
}

const scenes = {
  allee: Allee,
  parterre: Parterre,
  coastal: Coastal,
  evening: Evening,
  poolside: Poolside,
  cottage: Cottage,
};

export default function ProjectScene({
  variant,
  className = "",
  title,
}: {
  variant: SceneVariant;
  className?: string;
  title?: string;
}) {
  const Scene = scenes[variant];
  const p = `ps-${variant}`;
  return (
    <svg
      viewBox="0 0 800 600"
      className={className}
      role="img"
      aria-label={title ?? `Illustration of ${variant} garden project`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Scene p={p} />
    </svg>
  );
}
