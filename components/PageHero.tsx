import HeroPhoto from "./HeroPhoto";

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
      <HeroPhoto
        src="/photos/hero.jpg"
        fallbackSrc="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=72"
        idPrefix={idPrefix}
      />
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
