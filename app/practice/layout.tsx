import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Dial — AI AT WORK rep practice",
  description:
    "Internal cold-call practice for AI AT WORK reps. Eight moves, live objections, scored on the manager scorecard.",
  robots: { index: false, follow: false },
};

export default function PracticeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-practice bg-dial text-dial-text min-h-dvh flex flex-col">
      <header className="border-b border-dial-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
            AI AT WORK
          </span>
          <span className="font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
            Academy · Rep practice
          </span>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-dial-line">
        <div className="mx-auto max-w-5xl px-5 py-5">
          <p className="text-xs text-dial-dim">
            Internal training tool. Every business and contact in this simulator
            is fictional.
          </p>
        </div>
      </footer>
    </div>
  );
}
