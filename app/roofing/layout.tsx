import type { Metadata } from "next";
import Header from "@/components/roofing/Header";
import Footer from "@/components/roofing/Footer";

export const metadata: Metadata = {
  title: {
    default: "Coast to Coast Roofing — Biloxi, MS | Roof Repair & Replacement",
    template: "%s — Coast to Coast Roofing",
  },
  description:
    "Locally owned roofing on the Mississippi Gulf Coast. Roof replacement, repair, storm & insurance claims, and free inspections in Biloxi, Gulfport, Ocean Springs and beyond. BBB Accredited. Call (228) 234-1371.",
};

export default function RoofingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-roofing bg-bone text-ink min-h-dvh flex flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
