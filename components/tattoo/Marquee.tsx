import { site } from "@/lib/tattoo-site";
import { IconStar } from "./icons";

/**
 * The flash-sheet marquee — the site's signature strip. Lists the studio's
 * styles on a continuous ticker; pauses on hover and under reduced motion.
 */
export default function Marquee({ className = "" }: { className?: string }) {
  const items = site.styles;
  const Row = () => (
    <span className="flex shrink-0 items-center">
      {items.map((s) => (
        <span key={s} className="flex items-center">
          <span className="font-display leading-[1.35] tracking-[0.06em] text-[clamp(1.2rem,2.4vw,1.8rem)] text-volt whitespace-nowrap px-6">
            {s}
          </span>
          <IconStar className="w-4 h-4 text-flash shrink-0" />
        </span>
      ))}
    </span>
  );
  return (
    <div className={`marquee overflow-hidden border-y border-salt/10 bg-void py-5 ${className}`}>
      <p className="sr-only">Styles we work in: {items.join(", ")}.</p>
      {/* Decorative ticker: the same list, read out once above. */}
      <div aria-hidden="true" className="marquee-track flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
