import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Songy Brothers Lawn & Landscape — Biloxi, Mississippi",
    template: "%s — Songy Brothers Lawn & Landscape",
  },
  description:
    "Family-owned lawn care and landscaping on the Mississippi Gulf Coast. Mowing, landscaping, sod, tree work, and seasonal cleanups in Biloxi, Gulfport, Ocean Springs, and beyond. Free estimates.",
};

export default function SongyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
