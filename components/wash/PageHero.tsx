import { Eyebrow } from "./ui";

export default function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-prussian text-chalk">
      <div
        className="wash-clean absolute inset-0 opacity-90"
        aria-hidden="true"
      />
      <div className="wash-prism absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-prussian/85 via-prussian/55 to-prussian/15"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
        <Eyebrow dark>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.3rem,5.6vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance">
          {title}
        </h1>
        {lede && (
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-chalk/80">
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
