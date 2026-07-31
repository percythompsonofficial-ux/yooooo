import type { Metadata } from "next";
import Header from "@/components/wash/Header";
import Footer from "@/components/wash/Footer";

export const metadata: Metadata = {
  title: {
    default:
      "Saltline Surface Co. — Pressure Washing & Soft Wash, Mississippi Gulf Coast",
    template: "%s — Saltline Surface Co.",
  },
  description:
    "Exterior surface restoration on the Mississippi Gulf Coast. Driveways, house soft wash, roof soft wash, brick, decks and pavers — each cleaned at the pressure the material can take. Free written quotes in Ocean Springs, Biloxi and Gulfport.",
};

export default function WashLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-wash flex min-h-dvh flex-col bg-chalk text-prussian">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
