"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ingestLecture, type IngestResult } from "@/app/study/actions";

export function IngestForm() {
  const [result, action, pending] = useActionState<IngestResult | null, FormData>(
    ingestLecture,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
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
          Phase one structures the whole lecture, then writes cards for the first
          section only — enough to judge whether the cards are worth reviewing.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Generating…" : "Generate cards"}
        </button>
        {pending && (
          <span className="text-sm text-stone-500">
            Two model calls, usually under a minute.
          </span>
        )}
      </div>

      {result && !result.ok && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="rounded border border-teal-300 bg-teal-50 px-3 py-2.5 text-sm text-teal-900">
          <p>
            Found {result.sections} sections and wrote{" "}
            <strong>{result.cards} cards</strong> for the first one
            {result.dropped > 0 && (
              <>
                {" "}
                — dropped {result.dropped} that quoted text not in the transcript
              </>
            )}
            .
          </p>
          <Link
            href="/study/review"
            className="mt-1 inline-block font-medium underline underline-offset-2"
          >
            Start reviewing →
          </Link>
        </div>
      )}
    </form>
  );
}
