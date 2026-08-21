import TattooImage from "./TattooImage";
import { site } from "@/lib/tattoo-site";

/**
 * Stands in for a portrait. The logo is already a drawing of the artist at
 * work, so it says what a photograph would — and it's his own mark. It fills
 * the panel outright rather than floating inside it.
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
    <div className={`relative overflow-hidden bg-salt ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photos/tattoo/brand-logo-square.png"
        alt={`${site.fullName} logo`}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
