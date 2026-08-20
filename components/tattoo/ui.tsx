import Link from "next/link";
import { IconStar } from "./icons";

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-[0.68rem] sm:text-xs uppercase tracking-[0.28em] text-volt ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  center = false,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-display font-extrabold uppercase text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.95] tracking-[0.01em] text-salt">
        {title}
      </h2>
    </div>
  );
}

const buttonBase =
  "inline-flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.22em] px-7 py-4 transition-colors duration-200 cursor-pointer";

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}) {
  const styles =
    variant === "solid"
      ? "bg-volt text-void hover:bg-salt"
      : variant === "outline"
        ? "border border-salt/40 text-salt hover:border-volt hover:text-volt"
        : "text-salt hover:text-volt";
  const external = /^(https?:|tel:|mailto:)/.test(href);
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

/** Three nautical stars on a hairline — the flash-sheet section divider. */
export function StarRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-flash ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-salt/15" />
      <IconStar className="w-3.5 h-3.5" />
      <IconStar className="w-5 h-5" />
      <IconStar className="w-3.5 h-3.5" />
      <span className="h-px flex-1 bg-salt/15" />
    </div>
  );
}
