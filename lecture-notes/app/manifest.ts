import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lecture Notes",
    short_name: "Lectures",
    description: "Record a lecture, get notes you can actually study from.",
    start_url: "/",
    // Standalone so the record button isn't sharing the screen with a URL bar.
    display: "standalone",
    background_color: "#0b0b0e",
    theme_color: "#0b0b0e",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
