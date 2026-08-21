import { site } from "@/lib/tattoo-site";

/** The artist's own posted price list. */
export default function PriceList() {
  return (
    <div>
      <dl className="divide-y divide-salt/12 border-y border-salt/12">
        {site.pricing.map((row) => (
          <div
            key={row.item}
            className="flex items-baseline justify-between gap-6 py-3.5"
          >
            <dt className="font-display tracking-[0.02em] text-lg text-salt">
              {row.item}
            </dt>
            <dd className="font-mono text-sm tracking-[0.06em] text-volt shrink-0">
              {row.price}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm text-smoke leading-relaxed">{site.pricingNote}</p>
    </div>
  );
}
