import type { Verdict } from "@/lib/practice/types";

export const VERDICT_STYLE: Record<
  Verdict,
  { label: string; text: string; bg: string; border: string }
> = {
  correct: {
    label: "On script",
    text: "text-signal",
    bg: "bg-signal/10",
    border: "border-signal/40",
  },
  acceptable: {
    label: "Acceptable",
    text: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/40",
  },
  weak: {
    label: "Weak",
    text: "text-caution",
    bg: "bg-caution/10",
    border: "border-caution/40",
  },
  poor: {
    label: "Off script",
    text: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/40",
  },
};

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[0.68rem] font-semibold uppercase tracking-cap text-dial-dim">
      {children}
    </p>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-dial-line bg-dial-2 ${className}`}
    >
      {children}
    </div>
  );
}

export function Meter({
  value,
  label,
  hint,
}: {
  value: number;
  label: string;
  hint?: string;
}) {
  const tone =
    value > 60 ? "bg-signal" : value > 30 ? "bg-caution" : "bg-danger";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{label}</Eyebrow>
        <span className="font-display text-sm tabular-nums text-dial-text">
          {value}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full bg-dial-4"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full ${tone} transition-[width] duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-dial-dim">{hint}</p>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "solid",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.12em] px-6 py-3 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";
  const styles =
    variant === "solid"
      ? "bg-cyan text-dial hover:bg-white"
      : "border border-dial-line text-dial-text hover:border-cyan hover:text-cyan";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** A line of the live call transcript. */
export function Line({
  who,
  name,
  children,
}: {
  who: "prospect" | "rep";
  name: string;
  children: React.ReactNode;
}) {
  const isRep = who === "rep";
  return (
    <div className={`flex ${isRep ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[92%] sm:max-w-[80%] ${isRep ? "text-right" : ""}`}>
        <p
          className={`font-display text-[0.62rem] font-semibold uppercase tracking-cap ${
            isRep ? "text-cyan" : "text-dial-dim"
          }`}
        >
          {name}
        </p>
        <div
          className={`mt-1.5 border px-4 py-3 text-[0.94rem] leading-relaxed text-left ${
            isRep
              ? "border-cyan/30 bg-cyan/5 text-dial-text"
              : "border-dial-line bg-dial-3 text-dial-text"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
