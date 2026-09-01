import Link from "next/link";
import type { Metadata } from "next";
import { queueCounts } from "@/lib/study/db";

export const metadata: Metadata = {
  title: "Study",
  description: "Lecture transcripts in, recall cards out.",
};

// Every page here reads the queue live; nothing is prerendered.
export const dynamic = "force-dynamic";

export default async function StudyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let due = 0;
  let dbDown = false;
  try {
    ({ due } = await queueCounts());
  } catch {
    dbDown = true;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <nav className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
          <Link
            href="/study"
            className="font-mono text-sm font-medium tracking-tight text-stone-900"
          >
            study
          </Link>
          <div className="flex-1" />
          <Link
            href="/study"
            className="text-sm text-stone-600 transition-colors hover:text-teal-800"
          >
            Lectures
          </Link>
          <Link
            href="/study/review"
            className="flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-teal-800"
          >
            Review
            {due > 0 && (
              <span className="rounded-full bg-teal-800 px-2 py-0.5 font-mono text-xs tabular-nums text-white">
                {due}
              </span>
            )}
          </Link>
        </nav>
      </header>

      {dbDown && (
        <div className="border-b border-amber-300 bg-amber-50 px-6 py-3">
          <p className="mx-auto max-w-3xl text-sm text-amber-900">
            Can&rsquo;t reach the database. Check <code className="font-mono">DATABASE_URL</code>{" "}
            in <code className="font-mono">.env.local</code>, then run{" "}
            <code className="font-mono">npm run db:migrate</code>.
          </p>
        </div>
      )}

      <main id="main" className="mx-auto max-w-3xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
