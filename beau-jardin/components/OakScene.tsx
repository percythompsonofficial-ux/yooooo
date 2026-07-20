/* Layered live-oak grove in morning fog — pure SVG, no photography. */

function Oak({
  x,
  y,
  scale = 1,
  flip = false,
  fill,
  opacity = 1,
  moss = true,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  fill: string;
  opacity?: number;
  moss?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
      fill={fill}
      opacity={opacity}
    >
      {/* trunk with a live oak's low lean */}
      <path d="M-14 0 C-16 -40 -30 -70 -52 -96 L-38 -100 C-20 -78 -8 -52 -4 -20 C0 -52 14 -84 44 -110 L56 -102 C30 -78 16 -46 14 0 Z" />
      {/* limbs */}
      <path d="M10 -70 C60 -96 120 -104 180 -96 L178 -88 C122 -94 68 -84 20 -60 Z" />
      <path d="M-16 -76 C-70 -100 -130 -104 -186 -92 L-184 -84 C-130 -94 -76 -88 -24 -66 Z" />
      {/* canopy masses — rounded crown, not umbrella-flat */}
      <ellipse cx="-128" cy="-112" rx="88" ry="38" />
      <ellipse cx="126" cy="-118" rx="92" ry="40" />
      <ellipse cx="0" cy="-176" rx="86" ry="42" />
      <ellipse cx="-64" cy="-150" rx="76" ry="38" />
      <ellipse cx="68" cy="-156" rx="78" ry="40" />
      <ellipse cx="-30" cy="-122" rx="70" ry="36" />
      <ellipse cx="36" cy="-126" rx="72" ry="36" />
      {moss && (
        <g opacity="0.85">
          {/* spanish moss strands */}
          <path d="M-150 -104 C-152 -84 -148 -68 -152 -50 L-146 -50 C-144 -70 -147 -86 -144 -104 Z" />
          <path d="M-84 -100 C-87 -76 -82 -60 -86 -38 L-80 -38 C-78 -62 -81 -80 -78 -100 Z" />
          <path d="M-16 -112 C-19 -88 -14 -70 -18 -46 L-11 -46 C-9 -72 -13 -92 -10 -112 Z" />
          <path d="M52 -108 C49 -86 54 -70 50 -50 L56 -50 C58 -72 55 -88 58 -108 Z" />
          <path d="M124 -104 C121 -84 126 -70 122 -54 L128 -54 C130 -72 127 -86 130 -104 Z" />
        </g>
      )}
    </g>
  );
}

/* Overhanging canopy entering from a top corner, with hanging moss. */
function CornerCanopy({
  flip = false,
  fill,
}: {
  flip?: boolean;
  fill: string;
}) {
  return (
    <g transform={flip ? "translate(1440 0) scale(-1 1)" : undefined} fill={fill}>
      {/* limb sweeping in from the corner */}
      <path d="M0 0 L0 150 C90 140 200 120 320 96 C440 74 540 48 640 10 C650 6 656 2 660 0 Z" />
      {/* irregular leaf clusters breaking the limb's lower edge */}
      <ellipse cx="120" cy="118" rx="130" ry="48" />
      <ellipse cx="250" cy="96" rx="110" ry="40" />
      <ellipse cx="380" cy="66" rx="118" ry="38" />
      <ellipse cx="500" cy="40" rx="96" ry="32" />
      <ellipse cx="600" cy="18" rx="80" ry="28" />
      <ellipse cx="60" cy="150" rx="80" ry="34" />
      <ellipse cx="310" cy="120" rx="60" ry="26" opacity="0.9" />
      {/* hanging moss — languid curves, varied lengths */}
      <path d="M92 168 C82 200 96 226 84 268 C82 274 88 276 90 270 C100 234 90 206 102 170 Z" opacity="0.85" />
      <path d="M180 152 C168 192 184 228 170 286 C168 292 174 294 176 288 C190 236 176 200 190 156 Z" opacity="0.8" />
      <path d="M262 132 C274 168 260 198 272 240 C274 246 268 248 266 242 C256 202 268 172 254 134 Z" opacity="0.85" />
      <path d="M366 96 C356 128 370 156 358 196 C356 202 362 204 364 198 C374 162 364 132 376 100 Z" opacity="0.75" />
      <path d="M472 62 C482 92 470 116 480 150 C482 156 476 158 474 152 C466 120 476 96 464 64 Z" opacity="0.7" />
      <path d="M572 30 C564 54 574 74 566 102 C564 108 570 110 572 104 C580 78 572 58 580 32 Z" opacity="0.65" />
    </g>
  );
}

export default function OakScene({
  className = "",
  idPrefix = "oak",
}: {
  className?: string;
  idPrefix?: string;
}) {
  const p = idPrefix;
  return (
    <svg
      viewBox="0 0 1440 860"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c5142" />
          <stop offset="0.4" stopColor="#31453a" />
          <stop offset="0.75" stopColor="#1c2c22" />
          <stop offset="1" stopColor="#0c1712" />
        </linearGradient>
        <linearGradient id={`${p}-fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdd6ca" stopOpacity="0" />
          <stop offset="0.5" stopColor="#cdd6ca" stopOpacity="0.2" />
          <stop offset="1" stopColor="#cdd6ca" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1712" stopOpacity="0" />
          <stop offset="1" stopColor="#0c1712" />
        </linearGradient>
        <radialGradient id={`${p}-glow`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#e8e2cf" stopOpacity="0.26" />
          <stop offset="1" stopColor="#e8e2cf" stopOpacity="0" />
        </radialGradient>
        <filter id={`${p}-blur-far`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${p}-blur-mid`}>
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect width="1440" height="860" fill={`url(#${p}-sky)`} />
      {/* pale morning light in the glade */}
      <rect width="1440" height="860" fill={`url(#${p}-glow)`} />

      {/* far grove — dissolved in fog */}
      <g filter={`url(#${p}-blur-far)`} opacity="0.35">
        <Oak x={260} y={655} scale={0.7} fill="#2c3d31" moss={false} />
        <Oak x={720} y={645} scale={0.85} fill="#2c3d31" flip moss={false} />
        <Oak x={1180} y={658} scale={0.65} fill="#2c3d31" moss={false} />
      </g>

      {/* drifting fog band */}
      <g className="animate-drift">
        <rect x="-80" y="430" width="1600" height="200" fill={`url(#${p}-fog)`} />
      </g>

      {/* mid grove — full silhouettes against the sky */}
      <g filter={`url(#${p}-blur-mid)`}>
        <Oak x={330} y={690} scale={1.15} fill="#16241b" />
        <Oak x={1120} y={682} scale={1.28} fill="#14221a" flip />
      </g>

      {/* second fog band */}
      <g className="animate-drift" style={{ animationDelay: "-13s" }}>
        <rect x="-80" y="540" width="1600" height="170" fill={`url(#${p}-fog)`} opacity="0.8" />
      </g>

      {/* overhanging canopy frame — nearest layer */}
      <CornerCanopy fill="#0a140e" />
      <CornerCanopy fill="#0a140e" flip />

      {/* ground fade */}
      <rect y="640" width="1440" height="220" fill={`url(#${p}-ground)`} />
    </svg>
  );
}
