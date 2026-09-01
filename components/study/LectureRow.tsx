import Link from "next/link";
import { removeLecture } from "@/app/study/actions";
import type { LectureProgress } from "@/lib/study/jobs";
import type { LectureSummary } from "@/lib/study/types";

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-teal-100 text-teal-900",
  failed: "bg-red-100 text-red-900",
  pending: "bg-stone-200 text-stone-700",
  structuring: "bg-amber-100 text-amber-900",
  generating: "bg-amber-100 text-amber-900",
};

export function LectureRow({
  lecture: l,
  progress,
  showCourse = false,
  returnTo = "/study",
}: {
  lecture: LectureSummary;
  progress?: LectureProgress;
  showCourse?: boolean;
  returnTo?: string;
}) {
  const busy = progress ? progress.queued + progress.running > 0 : false;

  return (
    <li className="flex items-start gap-4 border-b border-stone-200 py-3.5">
      <div className="min-w-0 flex-1">
        <Link
          href={`/study/lectures/${l.id}`}
          className="font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {l.title}
        </Link>
        <p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums">
          {showCourse && l.course_name && l.course_name !== "Unfiled" && (
            <>{l.course_name} · </>
          )}
          {l.card_count} card{l.card_count === 1 ? "" : "s"}
          {l.due_count > 0 && ` · ${l.due_count} due`}
          {busy && progress && ` · ${progress.done}/${progress.total} generated`}
          {" · "}
          {new Date(l.created_at).toLocaleDateString()}
        </p>
        {l.status === "failed" && l.error && (
          <p className="mt-1 text-xs text-red-700">{l.error}</p>
        )}
      </div>

      <span
        className={`shrink-0 rounded px-2 py-0.5 font-mono text-[11px] ${
          STATUS_STYLE[l.status] ?? "bg-stone-200 text-stone-700"
        }`}
      >
        {l.status}
      </span>

      <form action={removeLecture} className="shrink-0">
        <input type="hidden" name="lectureId" value={l.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className="text-xs text-stone-400 underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Delete
        </button>
      </form>
    </li>
  );
}
