import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Lecture Notes",
  description: "Record a lecture, get notes you can actually study from.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Lectures",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0e",
  // The recorder runs edge to edge on a phone propped up on a desk.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  // Zoom stays available; disabling it breaks reading notes on a small screen.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
