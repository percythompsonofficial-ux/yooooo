import FlashArt from "./FlashArt";
import type { FlashItem } from "@/lib/tattoo-site";

/** One design on the flash wall, priced and ready to book as drawn. */
export default function FlashCard({ item }: { item: FlashItem }) {
  return (
    <figure className="group border border-salt/12 hover:border-volt/60 transition-colors duration-300">
      <div className="relative aspect-[4/5] overflow-hidden bg-void">
        <FlashArt
          design={item.design}
          className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 right-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] bg-volt text-void px-2.5 py-1">
          {item.price}
        </span>
      </div>
      <figcaption className="p-4 border-t border-salt/12">
        <h3 className="font-display font-bold uppercase text-xl leading-none text-salt group-hover:text-volt transition-colors duration-200">
          {item.name}
        </h3>
        <p className="mt-2.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-volt">
          {item.style}
        </p>
        <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-smoke">
          {item.size} · {item.artist}
        </p>
      </figcaption>
    </figure>
  );
}
