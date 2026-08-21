import TattooImage from "./TattooImage";
import { site } from "@/lib/tattoo-site";

/**
 * Stands in for a portrait. The logo is already a drawing of the artist at
 * work, so it says what a photograph would — and it's his own mark.
 */
export default function ArtistMark({
  photo = "",
  className = "",
}: {
  /** A real portrait takes over here whenever one exists. */
  photo?: string;
  className?: string;
}) {
  if (photo) {
    return (
      <TattooImage
        src={photo}
        alt={`Portrait of ${site.name}`}
        label={site.name}
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-char border border-salt/12 ${className}`}
    >
      {/* faint tide lines, echoing the rule marks used elsewhere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 22px, var(--color-volt) 22px 23px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-5 px-6 py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photos/tattoo/brand-logo.png"
          alt={`${site.fullName} logo`}
          className="w-40 sm:w-52 rounded-full"
        />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-smoke text-center">
          {site.studio} · {site.location}
        </p>
      </div>
    </div>
  );
}
