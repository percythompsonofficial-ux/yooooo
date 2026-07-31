import Link from "next/link";
import { tipMeta, type TipCode } from "@/lib/wash-site";

/**
 * The site's divider: a spray fan leaving a nozzle, standing in for the
 * usual horizontal rule. Quiet enough to repeat, specific enough to belong.
 */
export function FanRule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 76 18"
      className={`h-[18px] w-[76px] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 9 L72 1.5" opacity="0.45" />
      <path d="M2 9 L74 5.2" opacity="0.7" />
      <path d="M2 9 L75 9" />
      <path d="M2 9 L74 12.8" opacity="0.7" />
      <path d="M2 9 L72 16.5" opacity="0.45" />
    </svg>
  );
}

export function Eyebrow({
  children,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`spec ${dark ? "text-spray-lit" : "text-spray-ink"} ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  dark = false,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-4 font-display font-semibold leading-[0.98] text-[clamp(2rem,4.4vw,3.4rem)] text-balance ${
          dark ? "text-chalk" : "text-prussian"
        }`}
      >
        {title}
      </h2>
      <FanRule className={`mt-6 ${dark ? "text-spray-lit" : "text-spray"}`} />
      {lede && (
        <p
          className={`mt-6 max-w-[54ch] text-[1.0625rem] leading-relaxed ${
            dark ? "text-efflor" : "text-stone"
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2.5 font-display font-semibold text-[0.9375rem] tracking-[-0.01em] px-7 py-4 rounded-full transition-[background-color,border-color,color,transform] duration-200 cursor-pointer active:scale-[0.985]";

export function Button({
  href,
  children,
  variant = "solid",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "quiet";
  external?: boolean;
  className?: string;
}) {
  const styles = {
    solid: "bg-spray text-prussian hover:bg-spray-lit",
    outline:
      "border border-chalk/35 text-chalk hover:border-spray-lit hover:text-spray-lit",
    quiet:
      "border border-prussian/20 text-prussian hover:border-spray hover:text-spray-ink",
  }[variant];
  const cls = `${buttonBase} ${styles} ${className}`;

  if (external) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/**
 * The site's structural device: the real nozzle spec for a job. The colour
 * dot is the industry tip code, always paired with the written spec so it
 * never carries meaning on colour alone.
 */
export function TipSpec({
  tip,
  spec,
  dark = false,
  className = "",
}: {
  tip: TipCode;
  spec: string;
  dark?: boolean;
  className?: string;
}) {
  const meta = tipMeta[tip];
  return (
    <p
      className={`spec flex items-start gap-2.5 ${
        dark ? "text-efflor" : "text-stone"
      } ${className}`}
    >
      <span
        className={`mt-[5px] inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
          tip === "soap" ? "ring-1 ring-current" : ""
        }`}
        style={{ background: meta.color }}
        aria-hidden="true"
      />
      <span className="sr-only">{meta.label}. </span>
      {spec}
    </p>
  );
}
