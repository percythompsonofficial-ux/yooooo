"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ingestLecture, type IngestResult } from "@/app/study/actions";

type CourseOption = { id: string; name: string; term: string };

export function IngestForm({
  courses,
  defaultCourseId,
}: {
  courses: CourseOption[];
  defaultCourseId?: string;
}) {
  const [result, action, pending] = useActionState<IngestResult | null, FormData>(
    ingestLecture,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-stone-700">
            Title <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Week 4 — E1 elimination"
            className="rounded border border-stone-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-stone-400 focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
          />
          <p className="text-xs text-stone-500">
            Left blank, the model titles it from the transcript.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseId" className="text-sm font-medium text-stone-700">
            Course
          </label>
          <select
            id="courseId"
            name="courseId"
            defaultValue={defaultCourseId}
            className="rounded border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.term ? ` · ${c.term}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="transcript" className="text-sm font-medium text-stone-700">
          Transcript
        </label>
        <textarea
          id="transcript"
          name="transcript"
          required
          rows={12}
          placeholder="Paste the lecture transcript or caption text here…"
          className="resize-y rounded border border-stone-300 bg-white px-3 py-2 font-mono text-[13px] leading-relaxed outline-none placeholder:text-stone-400 focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
        />
        <p className="text-xs text-stone-500">
          Queued, not generated on the spot — a full lecture is a dozen model
          calls. The worker picks it up and the page tracks progress.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Queueing…" : "Queue lecture"}
        </button>
      </div>

      {result && !result.ok && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="rounded border border-teal-300 bg-teal-50 px-3 py-2.5 text-sm text-teal-900">
          <p>Queued. Generation runs in the background.</p>
          <Link
            href={`/study/lectures/${result.lectureId}`}
            className="mt-1 inline-block font-medium underline underline-offset-2"
          >
            Watch it come in →
          </Link>
        </div>
      )}
    </form>
  );
}
