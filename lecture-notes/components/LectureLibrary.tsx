"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getResult, listLectures, storageEstimate } from "@/lib/db";
import { bytes, hhmmss, relativeDate, stamp } from "@/lib/format";
import type { Lecture, LectureResult } from "@/lib/types";

/**
 * The library exists for one moment: the week before finals, when the question
 * is "when did he actually talk about this?" So search runs over the full
 * transcript of every lecture, not just the titles, and every hit is a link
 * into the exact second of the recording.
 */
export default function LectureLibrary() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [results, setResults] = useState<Record<string, LectureResult>>({});
  const [query, setQuery] = useState("");
  const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const all = await listLectures();
      setLectures(all);
      const entries = await Promise.all(
        all.map(async (l) => [l.id, await getResult(l.id)] as const),
      );
      const map: Record<string, LectureResult> = {};
      for (const [id, r] of entries) if (r) map[id] = r;
      setResults(map);
      setUsage(await storageEstimate());
      setLoading(false);
    })();
  }, []);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return null;
    return lectures
      .map((lecture) => {
        const result = results[lecture.id];
        const hits = (result?.segments ?? [])
          .filter((s) => s.text.toLowerCase().includes(q))
          .slice(0, 4);
        const headerHit =
          lecture.course.toLowerCase().includes(q) ||
          lecture.title.toLowerCase().includes(q);
        return { lecture, hits, headerHit };
      })
      .filter((m) => m.hits.length > 0 || m.headerHit);
  }, [q, lectures, results]);

  const shown = matches ? matches.map((m) => m.lecture) : lectures;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search every lecture…"
        className="w-full rounded-lg border border-hairline bg-panel px-3 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-faint"
      />

      {loading && <p className="text-sm text-faint">Loading…</p>}

      {!loading && lectures.length === 0 && (
        <div className="rounded-xl border border-hairline bg-panel px-4 py-10 text-center">
          <p className="text-sm text-muted">No lectures yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-rec px-4 py-2 text-sm font-semibold text-white"
          >
            Record one
          </Link>
        </div>
      )}

      {!loading && matches && matches.length === 0 && (
        <p className="text-sm text-faint">
          Nothing matches &ldquo;{query}&rdquo;. Only lectures that have been
          transcribed are searchable.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {shown.map((lecture) => {
          const match = matches?.find((m) => m.lecture.id === lecture.id);
          const result = results[lecture.id];
          return (
            <li key={lecture.id}>
              <Link
                href={`/lectures/${lecture.id}`}
                className="block rounded-xl border border-hairline bg-panel p-4 transition-colors hover:border-faint"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-faint">
                    {lecture.course || "No course"}
                  </span>
                  <StatusChip lecture={lecture} />
                </div>
                <h2 className="mt-1 font-serif text-lg leading-snug tracking-tight">
                  {lecture.title || result?.notes?.title || "Untitled lecture"}
                </h2>
                <p className="mt-0.5 text-xs text-faint">
                  {relativeDate(lecture.createdAt)} · {hhmmss(lecture.durationMs)}
                  {lecture.sizeBytes > 0 && ` · ${bytes(lecture.sizeBytes)}`}
                  {lecture.marks.length > 0 &&
                    ` · ★ ${lecture.marks.length}`}
                </p>
              </Link>

              {match && match.hits.length > 0 && (
                <ul className="mt-1.5 flex flex-col gap-1 pl-3">
                  {match.hits.map((hit, i) => (
                    <li key={i}>
                      <Link
                        href={`/lectures/${lecture.id}#t=${Math.floor(hit.start)}`}
                        className="flex gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-panel"
                      >
                        <span className="shrink-0 font-mono text-[11px] tabular-nums text-faint">
                          {stamp(hit.start)}
                        </span>
                        <span className="text-xs leading-relaxed text-muted">
                          {hit.text}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && usage.usedBytes > 0 && (
        <p className="border-t border-hairline pt-4 text-center text-xs text-faint">
          Using {bytes(usage.usedBytes)} on this device
          {usage.quotaBytes > 0 && ` of about ${bytes(usage.quotaBytes)}`}. Open
          a lecture to delete its audio and keep the notes.
        </p>
      )}
    </div>
  );
}

function StatusChip({ lecture }: { lecture: Lecture }) {
  const map: Record<string, [string, string]> = {
    recording: ["Interrupted", "text-star"],
    recorded: ["Not processed", "text-faint"],
    transcribing: ["Transcribing…", "text-muted"],
    transcribed: ["No notes yet", "text-faint"],
    noting: ["Writing notes…", "text-muted"],
    done: ["", ""],
    error: ["Failed", "text-rec"],
  };
  const [label, className] = map[lecture.status] ?? ["", ""];
  if (!label) return null;
  return (
    <span className={`text-[11px] font-medium ${className}`}>{label}</span>
  );
}
