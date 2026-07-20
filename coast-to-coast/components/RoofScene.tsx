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
          <stop offset="0" stopColor="#2a3b4a" />
          <stop offset="1" stopColor="#16212c" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${p}-sky)`} />
      {/* sun/haze */}
      <circle cx="620" cy="150" r="70" fill="#e07a1f" opacity="0.18" />
      <circle cx="620" cy="150" r="40" fill="#e07a1f" opacity="0.22" />

      {/* far rooftops */}
      <g fill="#1c2b38">
        <path d="M0 380 L90 320 L180 380 Z" />
        <path d="M150 380 L250 310 L350 380 Z" />
        <path d="M330 380 L430 315 L530 380 Z" />
        <path d="M500 380 L600 320 L700 380 Z" />
        <path d="M660 380 L760 325 L800 360 L800 380 Z" />
        <rect x="0" y="378" width="800" height="60" />
      </g>

      {/* mid houses with pitched roofs */}
      <g>
        <g fill="#22323f">
          <path d="M60 470 L140 405 L220 470 Z" />
          <rect x="80" y="466" width="120" height="90" />
        </g>
        <g fill="#26384a">
          <path d="M250 470 L340 398 L430 470 Z" />
          <rect x="272" y="466" width="136" height="94" />
        </g>
        <g fill="#22323f">
          <path d="M450 470 L540 405 L630 470 Z" />
          <rect x="472" y="466" width="136" height="94" />
        </g>
        <g fill="#26384a">
          <path d="M640 470 L720 410 L800 470 L800 560 L640 560 Z" />
        </g>
      </g>

      {/* amber-lit windows */}
      <g fill="#e07a1f" opacity="0.75">
        <rect x="110" y="492" width="20" height="24" />
        <rect x="150" y="492" width="20" height="24" />
        <rect x="305" y="490" width="22" height="26" />
        <rect x="352" y="490" width="22" height="26" />
        <rect x="505" y="492" width="22" height="26" />
        <rect x="552" y="492" width="22" height="26" />
      </g>
      <rect y="556" width="800" height="44" fill="#12191f" />
    </svg>
  );
}
