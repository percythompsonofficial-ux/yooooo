import type { Metadata } from "next";
import Header from "@/components/tattoo/Header";
import Footer from "@/components/tattoo/Footer";

export const metadata: Metadata = {
  title: {
    default: "InkdUpJo — Tattoo Artist in Gautier, Mississippi",
    template: "%s — InkdUpJo Tattoo",
  },
  description:
    "InkdUpJo (Tatz by Jo) — custom tattoos in Gautier, Mississippi. Script and lettering, black-and-grey realism, portraits, and sleeve work. $50 deposit, 18+ with ID. DM @inkdupjo to book.",
};

export default function TattooLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-tattoo flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
