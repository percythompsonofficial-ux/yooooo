import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Coast to Coast Roofing — Biloxi, MS | Roof Repair & Replacement",
    template: "%s — Coast to Coast Roofing",
  },
  description:
    "Locally owned roofing on the Mississippi Gulf Coast. Roof replacement, repair, storm & insurance claims, and free inspections in Biloxi, Gulfport, Ocean Springs and beyond. BBB Accredited. Call (228) 234-1371.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-amber focus:text-white focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
