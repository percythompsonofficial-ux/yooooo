import Link from "next/link";

export function Eyebrow({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <p
      className={`font-display text-xs uppercase tracking-cap ${
        dark ? "text-amber" : "text-amber-deep"
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  dark = false,
  center = false,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-3 font-display font-bold uppercase leading-[0.98] text-[clamp(1.9rem,4.2vw,3.2rem)] ${
          dark ? "text-white" : "text-slate"
        }`}
      >
        {title}
      </h2>
      <div className={`rule-amber mt-5 ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-display uppercase tracking-[0.1em] text-sm font-semibold px-7 py-3.5 transition-colors duration-200 cursor-pointer";

export function Button({
  href,
  children,
  variant = "solid",
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  external?: boolean;
}) {
  const styles = {
    solid: "bg-amber text-white hover:bg-amber-deep",
    outline:
      "border-2 border-white/40 text-white hover:border-amber hover:text-amber",
    ghost: "border-2 border-slate/25 text-slate hover:border-amber hover:text-amber-deep",
  }[variant];
  const cls = `${buttonBase} ${styles} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
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
