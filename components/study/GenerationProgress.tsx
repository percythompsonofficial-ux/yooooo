"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LectureProgress } from "@/lib/study/jobs";

/**
 * Polls while there is outstanding work, and stops the moment there isn't.
 * The server component owns the data; this only decides when to re-ask.
 */
export function GenerationProgress({
  progress,
  status,
}: {
  progress: LectureProgress;
  status: string;
}) {
  const router = useRouter();
  const active = progress.queued + progress.running > 0;
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setWaited((w) => w + 1);
      router.refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [active, router]);

  if (progress.total === 0) return null;

  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <div className="flex flex-col gap-2 rounded border border-stone-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">
          {active
            ? status === "structuring"
              ? "Reading the lecture…"
              : "Writing cards and notes…"
            : progress.failed > 0
              ? "Finished with failures"
              : "Generation complete"}
        </span>
        <span className="font-mono text-xs tabular-nums text-stone-500">
          {progress.done}/{progress.total}
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={progress.done}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-label="Generation progress"
      >
        <div
          className={`h-full transition-[width] duration-500 motion-reduce:transition-none ${
            progress.failed > 0 ? "bg-amber-500" : "bg-teal-700"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="font-mono text-[11px] text-stone-500">
        {progress.running > 0 && `${progress.running} running · `}
        {progress.queued > 0 && `${progress.queued} queued · `}
        {progress.failed > 0 && `${progress.failed} failed · `}
        {progress.done} done
      </p>

      {active && waited > 20 && (
        <p className="rounded border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
          Still queued after a while? The worker only runs when something calls{" "}
          <code className="font-mono">/api/jobs/run</code> — a cron in
          production, or <code className="font-mono">npm run jobs:work</code>{" "}
          locally.
        </p>
      )}
    </div>
  );
}
