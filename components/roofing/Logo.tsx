export function RoofMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="3"
        className="fill-amber"
      />
      {/* coast-to-coast rooflines: two peaks */}
      <path
        d="M6 24 L13 15 L20 24"
        stroke="#16212c"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 24 L27 15 L34 24"
        stroke="#16212c"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 28 H34" stroke="#16212c" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <RoofMark className="w-9 h-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-bold text-[1.35rem] uppercase tracking-[0.02em] ${
            dark ? "text-slate" : "text-white"
          }`}
        >
          Coast to Coast
        </span>
        <span
          className={`font-display text-[0.72rem] uppercase tracking-[0.34em] mt-1 ${
            dark ? "text-amber-deep" : "text-amber"
          }`}
        >
          Roofing
        </span>
      </span>
    </span>
  );
}
