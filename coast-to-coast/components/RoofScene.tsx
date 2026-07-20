/* Simple Gulf-Coast rooftop skyline — SVG fallback when no photo loads. */

export default function RoofScene({
  className = "",
  idPrefix = "roof",
}: {
  className?: string;
  idPrefix?: string;
}) {
  const p = idPrefix;
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d5259" />
          <stop offset="0.55" stopColor="#2b2530" />
          <stop offset="1" stopColor="#1a1820" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-sky)`} />
      {/* dusk sun/haze */}
      <circle cx="620" cy="150" r="72" fill="#e7d24a" opacity="0.16" />
      <circle cx="620" cy="150" r="40" fill="#e7d24a" opacity="0.2" />

      {/* far rooftops */}
      <g fill="#241f2b">
        <path d="M0 380 L90 320 L180 380 Z" />
        <path d="M150 380 L250 310 L350 380 Z" />
        <path d="M330 380 L430 315 L530 380 Z" />
        <path d="M500 380 L600 320 L700 380 Z" />
        <path d="M660 380 L760 325 L800 360 L800 380 Z" />
        <rect x="0" y="378" width="800" height="60" />
      </g>

      {/* mid houses with pitched roofs */}
      <g>
        <g fill="#2b2530">
          <path d="M60 470 L140 405 L220 470 Z" />
          <rect x="80" y="466" width="120" height="90" />
        </g>
        <g fill="#322e3b">
          <path d="M250 470 L340 398 L430 470 Z" />
          <rect x="272" y="466" width="136" height="94" />
        </g>
        <g fill="#2b2530">
          <path d="M450 470 L540 405 L630 470 Z" />
          <rect x="472" y="466" width="136" height="94" />
        </g>
        <g fill="#322e3b">
          <path d="M640 470 L720 410 L800 470 L800 560 L640 560 Z" />
        </g>
      </g>

      {/* warm-lit windows */}
      <g fill="#e7d24a" opacity="0.8">
        <rect x="110" y="492" width="20" height="24" />
        <rect x="150" y="492" width="20" height="24" />
        <rect x="305" y="490" width="22" height="26" />
        <rect x="352" y="490" width="22" height="26" />
        <rect x="505" y="492" width="22" height="26" />
        <rect x="552" y="492" width="22" height="26" />
      </g>
      <rect y="556" width="800" height="44" fill="#12111a" />
    </svg>
  );
}
