export function OakLeafMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* Stylized live-oak leaf inside a thin ring */}
      <circle
        cx="24"
        cy="24"
        r="22.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M24 38 C24 30 24 22 24 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M24 14 C19 15.5 15.5 19.5 15 25 C19.5 24 23 20.5 24 14 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 14 C29 15.5 32.5 19.5 33 25 C28.5 24 25 20.5 24 14 Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M24 24 C20.5 25.5 18.5 28.5 18.2 32.5 C21.6 31.4 23.6 28.6 24 24 Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M24 24 C27.5 25.5 29.5 28.5 29.8 32.5 C26.4 31.4 24.4 28.6 24 24 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export default function Wordmark({
  stacked = false,
  className = "",
}: {
  stacked?: boolean;
  className?: string;
}) {
  if (stacked) {
    return (
      <span className={`flex flex-col items-center gap-4 ${className}`}>
        <OakLeafMark className="w-12 h-12" />
        <span className="font-display text-[clamp(2.4rem,6.4vw,5rem)] leading-[0.95] font-medium tracking-[0.1em] uppercase">
          Songy Brothers
        </span>
        <span className="text-[0.68rem] sm:text-xs tracking-cap uppercase opacity-80">
          Lawn &amp; Landscape — Biloxi, Mississippi
        </span>
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <OakLeafMark className="w-8 h-8 shrink-0" />
      <span className="flex flex-col leading-tight">
        <span className="font-display text-xl font-semibold tracking-[0.14em] uppercase">
          Songy Brothers
        </span>
        <span className="text-[0.6rem] tracking-[0.26em] uppercase opacity-70">
          Lawn &amp; Landscape
        </span>
      </span>
    </span>
  );
}
