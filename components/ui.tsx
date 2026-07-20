import Link from "next/link";

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.7rem] sm:text-xs uppercase tracking-cap text-brass-deep ${className}`}
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
  eyebrow: string;
  title: React.ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <p
        className={`text-[0.7rem] sm:text-xs uppercase tracking-cap ${
          dark ? "text-brass" : "text-brass-deep"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display font-medium text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] ${
          dark ? "text-ivory" : "text-ink"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

const buttonBase =
  "inline-block text-[0.78rem] uppercase tracking-[0.22em] px-8 py-4 transition-colors duration-200 cursor-pointer";

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "outline-dark";
  className?: string;
}) {
  const styles = {
    solid: "bg-brass text-pine hover:bg-ivory",
    outline:
      "border border-ivory/40 text-ivory hover:border-brass hover:text-brass",
    "outline-dark":
      "border border-ink/30 text-ink hover:border-brass-deep hover:text-brass-deep",
  }[variant];
  return (
    <Link href={href} className={`${buttonBase} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
