import type { Metadata } from "next";
import Header from "@/components/tattoo/Header";
import Footer from "@/components/tattoo/Footer";

export const metadata: Metadata = {
  title: {
    default: "InkdUpJo Tattoo — Custom Tattoos in Biloxi, Mississippi",
    template: "%s — InkdUpJo Tattoo",
  },
  description:
    "Custom tattoo studio on the Mississippi Gulf Coast. American traditional, fine line, blackwork, Japanese, and cover-ups. Walk-ins welcome. Book a free consult.",
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
