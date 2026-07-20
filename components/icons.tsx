/* Hand-drawn 24px line icons, 1.5px stroke — one family, garden vernacular. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconCompassRose({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 5.5 L13.8 10.2 L18.5 12 L13.8 13.8 L12 18.5 L10.2 13.8 L5.5 12 L10.2 10.2 Z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTopiary({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M12 12.5 V16" />
      <path d="M8 20 h8" />
      <path d="M9 16 h6 l1 4 h-8 Z" />
    </svg>
  );
}

export function IconOak({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21 C11.5 16 11.5 12 12 8" />
      <path d="M12 10 C9 9 7.5 7 7 4.5 C10 5 11.5 6.5 12 10 Z" />
      <path d="M12 8 C15 7.5 17 6 17.8 3.5 C14.5 4 12.8 5.3 12 8 Z" />
      <path d="M12 14 C9.8 13.6 8.5 12.4 8 10.5 C10.3 11 11.5 12 12 14 Z" />
      <path d="M12 13 C14.2 12.8 15.6 11.8 16.2 10 C13.9 10.4 12.6 11.3 12 13 Z" />
      <path d="M7 21 c3 -1.2 7 -1.2 10 0" />
    </svg>
  );
}

export function IconLantern({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 v2" />
      <path d="M9 5 h6 l1.2 3 h-8.4 Z" />
      <path d="M9.5 8 v6 a2.5 2.5 0 0 0 5 0 V8" />
      <path d="M12 10.5 v3" />
      <path d="M10 21 h4" />
      <path d="M12 16.5 V21" />
    </svg>
  );
}

export function IconDrop({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 C15.5 8 18 11 18 14.5 a6 6 0 0 1 -12 0 C6 11 8.5 8 12 3.5 Z" />
      <path d="M9.5 14.5 a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  );
}

export function IconTrowel({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 19.5 L10 14" />
      <path d="M10 14 L8.5 12.5 C11 8.5 15 6 19.5 4.5 C18 9 15.5 13 11.5 15.5 Z" />
      <path d="M14 10 L12 12" />
    </svg>
  );
}

export function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12 h15" />
      <path d="M14 6.5 L19.5 12 L14 17.5" />
    </svg>
  );
}

export function IconQuote({ className = "" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 7.5 C6.5 8.5 5 10.5 5 13.5 a3 3 0 1 0 3 -3 c0 -1.2 0.5 -2 1.5 -3 Z" />
      <path d="M18.5 7.5 C15.5 8.5 14 10.5 14 13.5 a3 3 0 1 0 3 -3 c0 -1.2 0.5 -2 1.5 -3 Z" />
    </svg>
  );
}
