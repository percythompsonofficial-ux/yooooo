/* 24px line icons, 1.6px stroke — one Saltline family. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

type P = { className?: string };

/** The brand mark: a spray fan leaving a nozzle. */
export function IconFan({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4.5 L6 8" />
      <path d="M6 6.25 L18.5 3" />
      <path d="M6 6.25 L19.5 8.5" />
      <path d="M6 6.25 L19 14" />
      <path d="M6 6.25 L16.5 18.5" />
      <path d="M6 6.25 L12 21" />
    </svg>
  );
}

export function IconSurfaceCleaner({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="14" r="7" />
      <path d="M12 4 V7" />
      <path d="M7.5 14 h9" />
      <circle cx="12" cy="14" r="1.4" />
    </svg>
  );
}

export function IconHouse({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 11 L12 4 L20.5 11" />
      <path d="M5.5 9.5 V20 h13 V9.5" />
      <path d="M5.5 13.5 h13" />
      <path d="M5.5 17 h13" />
    </svg>
  );
}

export function IconRoofSoft({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 13 L12 5.5 L21.5 13" />
      <path d="M6 12 L8 20" />
      <path d="M11 11 L12.5 20" />
      <path d="M16 12 L17.5 19" />
    </svg>
  );
}

export function IconBrick({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="0.5" />
      <path d="M3 9.7 h18" />
      <path d="M3 14.4 h18" />
      <path d="M9 5 v4.7" />
      <path d="M15 9.7 v4.7" />
      <path d="M9 14.4 V19" />
    </svg>
  );
}

export function IconDeck({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M3 6.5 h18" />
      <path d="M3 11 h18" />
      <path d="M3 15.5 h18" />
      <path d="M3 20 h18" />
      <path d="M8 4.5 V21" />
      <path d="M16 4.5 V21" />
    </svg>
  );
}

export function IconPaver({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="7.5" height="7.5" rx="0.5" />
      <rect x="13.5" y="4" width="7.5" height="7.5" rx="0.5" />
      <rect x="3" y="12.5" width="7.5" height="7.5" rx="0.5" />
      <rect x="13.5" y="12.5" width="7.5" height="7.5" rx="0.5" />
    </svg>
  );
}

export function IconDroplet({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 C15 8 18 10.8 18 14 A6 6 0 0 1 6 14 C6 10.8 9 8 12 3.5 Z" />
    </svg>
  );
}

export function IconCheck({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />
    </svg>
  );
}

export function IconArrow({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12 h14" />
      <path d="M13 6.5 L18.5 12 L13 17.5" />
    </svg>
  );
}

export function IconPhone({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M7.2 3.8 H4.6 A1.6 1.6 0 0 0 3 5.5 C3 13.9 10.1 21 18.5 21 A1.6 1.6 0 0 0 20.2 19.4 V16.8 L16.4 15.5 L14.6 17.8 A13.5 13.5 0 0 1 6.2 9.4 L8.5 7.6 Z" />
    </svg>
  );
}

export function IconMapPin({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21 C12 21 19 15.4 19 10 A7 7 0 0 0 5 10 C5 15.4 12 21 12 21 Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function IconShield({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 L19 6 V11 C19 16 15.5 19.5 12 21 C8.5 19.5 5 16 5 11 V6 Z" />
      <path d="M9 12 l2 2 l4 -4.5" />
    </svg>
  );
}

export function IconClock({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7 v5.3 l3.4 2" />
    </svg>
  );
}

export function IconThermometer({ className = "" }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M14 14.2 V5.5 a2 2 0 0 0 -4 0 v8.7 a4 4 0 1 0 4 0 Z" />
      <path d="M12 10 v5.5" />
    </svg>
  );
}

export const surfaceIcons = {
  concrete: IconSurfaceCleaner,
  "house-wash": IconHouse,
  roof: IconRoofSoft,
  masonry: IconBrick,
  wood: IconDeck,
  pavers: IconPaver,
} as const;
