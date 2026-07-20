/* 24px line icons, 1.75px stroke — one roofing family. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconRoof({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12 L12 4 L21 12" />
      <path d="M5.5 10.2 V20 h13 V10.2" />
      <path d="M10 20 v-5 h4 v5" />
    </svg>
  );
}

export function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 L19 6 V11 c0 5 -3.5 8.5 -7 10 c-3.5 -1.5 -7 -5 -7 -10 V6 Z" />
      <path d="M9 12 l2 2 l4 -4.5" />
    </svg>
  );
}

export function IconLeak({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5 L20 5" />
      <path d="M6.5 5 L9.5 10" />
      <path d="M12 8 C14 11 15.5 12.8 15.5 14.8 A3 3 0 0 1 9.5 14.8 C9.5 12.8 11 11 12 8 Z" />
    </svg>
  );
}

export function IconStorm({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M7 16 a4 4 0 1 1 1 -7.9 A5 5 0 0 1 18 8.5 a3.5 3.5 0 0 1 -0.5 7 H8" />
      <path d="M12 13 l-2 3.5 h3 l-2 3.5" />
    </svg>
  );
}

export function IconClipboardCheck({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4 h6 v2.5 H9 Z" />
      <path d="M9 5.2 H6.5 V20 h11 V5.2 H15" />
      <path d="M9 13 l2 2 l4 -4" />
    </svg>
  );
}

export function IconWrench({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M15.5 4 a4.5 4.5 0 0 0 -5.8 5.8 L4 15.5 a2 2 0 0 0 2.8 2.8 L12.4 12.6 A4.5 4.5 0 0 0 18.2 6.8 L15.6 9.4 L13 8.4 L12 5.8 Z" />
    </svg>
  );
}

export function IconHome({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 11 L12 5 L20 11" />
      <path d="M6 9.5 V19 h12 V9.5" />
    </svg>
  );
}

export function IconBuilding({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 20 V5 h9 v15" />
      <path d="M15 20 V10 h3 v10" />
      <path d="M9 8 h3 M9 11 h3 M9 14 h3" />
      <path d="M4 20 h16" />
    </svg>
  );
}

export function IconStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 3.2 l2.5 5.4 l5.9 0.6 l-4.4 4 l1.3 5.8 L12 16.9 l-5.3 3.1 l1.3 -5.8 l-4.4 -4 l5.9 -0.6 Z" />
    </svg>
  );
}

export function IconPhone({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4 h3 l1.5 4 l-2 1.4 a11 11 0 0 0 5.1 5.1 l1.4 -2 l4 1.5 v3 a2 2 0 0 1 -2.2 2 A16 16 0 0 1 4 6.2 A2 2 0 0 1 6 4 Z" />
    </svg>
  );
}

export function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12 h15" />
      <path d="M14 6.5 L19.5 12 L14 17.5" />
    </svg>
  );
}

export function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12.5 l4 4 l10 -10" />
    </svg>
  );
}
