import TattooImage from "./TattooImage";
import type { WorkItem } from "@/lib/tattoo-site";

/** One piece of the artist's work. */
export default function WorkCard({ item }: { item: WorkItem }) {
  return (
    <figure className="group border border-salt/12 hover:border-volt/60 transition-colors duration-300">
      <TattooImage
        src={item.photo}
        alt={`${item.name} — ${item.style}, ${item.placement}`}
        label={item.name}
        className="aspect-[4/5]"
        objectPosition={item.focus}
        imgClassName="group-hover:scale-[1.04] transition-transform duration-700"
      />
      <figcaption className="p-4 border-t border-salt/12">
        {/* two-line floor keeps card captions aligned when a title wraps */}
        <h3 className="min-h-[2.5rem] font-display font-bold uppercase text-xl leading-[1.15] text-salt group-hover:text-volt transition-colors duration-200">
          {item.name}
        </h3>
        <p className="mt-2.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-volt">
          {item.style}
        </p>
        <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-smoke">
          {item.placement}
        </p>
      </figcaption>
    </figure>
  );
}
