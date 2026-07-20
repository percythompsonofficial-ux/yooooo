import OakScene from "./OakScene";

export default function PageHero({
  eyebrow,
  title,
  lede,
  idPrefix,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  idPrefix: string;
}) {
  return (
    <section className="relative bg-pine text-ivory overflow-hidden grain">
      <div className="absolute inset-0 opacity-50">
        <OakScene className="w-full h-full" idPrefix={idPrefix} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-pine/40 via-pine/30 to-pine" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-8 pt-44 pb-24 sm:pt-56 sm:pb-32 text-center">
        <p className="text-xs uppercase tracking-cap text-brass animate-fade-up">
          {eyebrow}
        </p>
        <h1
          className="mt-5 font-display font-medium text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          {title}
        </h1>
        {lede && (
          <p
            className="mt-7 max-w-xl mx-auto text-mist/90 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
