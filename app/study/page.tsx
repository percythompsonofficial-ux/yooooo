import Link from "next/link";
import { IngestForm } from "@/components/study/IngestForm";
import { removeLecture } from "@/app/study/actions";
import { listLectures, queueCounts } from "@/lib/study/db";
import type { LectureSummary } from "@/lib/study/types";

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-teal-100 text-teal-900",
  failed: "bg-red-100 text-red-900",
  pending: "bg-stone-200 text-stone-700",
  structuring: "bg-amber-100 text-amber-900",
  generating: "bg-amber-100 text-amber-900",
};

export default async function StudyHome() {
  let lectures: LectureSummary[] = [];
  let due = 0;
  let reachable = true;

  try {
    [lectures, { due }] = await Promise.all([listLectures(), queueCounts()]);
  } catch {
    reachable = false;
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Add a lecture</h1>
        <p className="max-w-prose text-sm text-stone-600">
          Paste a transcript. You get back a section outline and a set of recall
          cards, each one carrying the verbatim line it came from.
        </p>
        <div className="mt-2">
          <IngestForm />
        </div>
      </section>

      {reachable && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
            <h2 className="text-lg font-semibold tracking-tight">Lectures</h2>
            {due > 0 && (
              <Link
                href="/study/review"
                className="text-sm font-medium text-teal-800 underline underline-offset-2"
              >
                {due} card{due === 1 ? "" : "s"} due
              </Link>
            )}
          </div>

          {lectures.length === 0 ? (
            <p className="py-6 text-sm text-stone-500">
              Nothing yet. Paste a transcript above to get started.
            </p>
          ) : (
            <ul className="flex flex-col">
              {lectures.map((l) => (
                <li
                  key={l.id}
                  className="flex items-start gap-4 border-b border-stone-200 py-3.5"
                >
                  <div className="flex-1">
                    <p className="font-medium">{l.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums">
                      {l.card_count} card{l.card_count === 1 ? "" : "s"}
                      {l.due_count > 0 && ` · ${l.due_count} due`}
                      {" · "}
                      {new Date(l.created_at).toLocaleDateString()}
                    </p>
                    {l.status === "failed" && l.error && (
                      <p className="mt-1 text-xs text-red-700">{l.error}</p>
                    )}
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                      STATUS_STYLE[l.status] ?? "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {l.status}
                  </span>

                  <form action={removeLecture}>
                    <input type="hidden" name="lectureId" value={l.id} />
                    <button
                      type="submit"
                      className="text-xs text-stone-400 underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
