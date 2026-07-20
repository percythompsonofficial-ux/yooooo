import HeroBg from "./HeroBg";

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
    <section className="relative bg-slate text-white overflow-hidden">
      <HeroBg
        src="/photos/hero.jpg"
        fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1900&q=72"
        idPrefix={idPrefix}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
        <p className="font-display uppercase text-xs tracking-cap text-amber animate-fade-up">
          {eyebrow}
        </p>
        <h1
          className="mt-4 font-display font-bold uppercase leading-[0.95] text-[clamp(2.4rem,6vw,4.6rem)] animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {title}
        </h1>
        {lede && (
          <p
            className="mt-6 max-w-2xl mx-auto text-fog/90 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
