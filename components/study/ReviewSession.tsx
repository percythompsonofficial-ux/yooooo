"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rateCard } from "@/app/study/actions";
import { RATINGS, type DueCard, type RatingValue } from "@/lib/study/types";

const BUTTONS: { rating: RatingValue; label: string; key: string; tone: string }[] = [
  { rating: RATINGS.again, label: "Again", key: "1", tone: "border-red-300 text-red-800 hover:bg-red-50" },
  { rating: RATINGS.hard,  label: "Hard",  key: "2", tone: "border-amber-300 text-amber-800 hover:bg-amber-50" },
  { rating: RATINGS.good,  label: "Good",  key: "3", tone: "border-teal-300 text-teal-800 hover:bg-teal-50" },
  { rating: RATINGS.easy,  label: "Easy",  key: "4", tone: "border-sky-300 text-sky-800 hover:bg-sky-50" },
];

/**
 * Deterministic shuffle seeded by the card id. Math.random would give the
 * server and the client different orders and blow up hydration.
 */
function shuffleFor(id: string, options: string[]): string[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const out = [...options];
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ReviewSession({ queue }: { queue: DueCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tally, setTally] = useState({ again: 0, rest: 0 });
  const shownAt = useRef(Date.now());

  const card = queue[index];
  const done = index >= queue.length;

  const submit = useCallback(
    async (rating: RatingValue) => {
      if (!card || saving) return;
      setSaving(true);
      try {
        await rateCard(card.id, rating, Date.now() - shownAt.current);
        setTally((t) =>
          rating === RATINGS.again
            ? { ...t, again: t.again + 1 }
            : { ...t, rest: t.rest + 1 },
        );
        setIndex((i) => i + 1);
        setRevealed(false);
        shownAt.current = Date.now();
      } finally {
        setSaving(false);
      }
    },
    [card, saving],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const hit = BUTTONS.find((b) => b.key === e.key);
        if (hit) {
          e.preventDefault();
          void submit(hit.rating);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, done, submit]);

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Queue clear</h1>
        <p className="text-sm text-stone-600">
          {queue.length} card{queue.length === 1 ? "" : "s"} reviewed
          {tally.again > 0 && ` · ${tally.again} coming back shortly`}.
        </p>
        {/* Refresh on the way out, not on arrival: refreshing here would
            re-run the route, find nothing due, and replace this summary with
            the empty state before you had a chance to read it. */}
        <button
          type="button"
          onClick={() => {
            router.refresh();
            router.push("/study");
          }}
          className="rounded bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Back to lectures
        </button>
      </div>
    );
  }

  const options =
    card.kind === "mcq" && card.distractors?.length
      ? shuffleFor(card.id, [card.answer, ...card.distractors])
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={queue.length}
          aria-label="Review progress"
        >
          <div
            className="h-full bg-teal-700 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-stone-500">
          {index + 1}/{queue.length}
        </span>
      </div>

      <article className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
          {card.lecture_title} · {card.heading}
        </p>

        <h1 className="mt-3 text-xl font-medium leading-snug text-balance">
          {card.prompt}
        </h1>

        {options && (
          <ul className="mt-5 flex flex-col gap-2">
            {options.map((opt) => {
              const correct = revealed && opt === card.answer;
              return (
                <li
                  key={opt}
                  className={`rounded border px-3 py-2 text-sm transition-colors ${
                    correct
                      ? "border-teal-500 bg-teal-50 font-medium text-teal-900"
                      : "border-stone-200 text-stone-700"
                  }`}
                >
                  {opt}
                </li>
              );
            })}
          </ul>
        )}

        {revealed ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-stone-200 pt-5">
            {!options && (
              <p className="text-lg leading-snug text-stone-900">{card.answer}</p>
            )}
            <details className="group">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-stone-400 outline-none hover:text-teal-800 focus-visible:text-teal-800">
                From the lecture
              </summary>
              <blockquote className="mt-2 border-l-2 border-stone-300 pl-3 text-sm italic text-stone-600">
                {card.source_span}
              </blockquote>
            </details>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-6 rounded border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Show answer <span className="ml-1 text-stone-400">space</span>
          </button>
        )}
      </article>

      {revealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUTTONS.map((b) => (
            <button
              key={b.rating}
              type="button"
              disabled={saving}
              onClick={() => void submit(b.rating)}
              className={`flex flex-col items-center gap-0.5 rounded border bg-white px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50 ${b.tone}`}
            >
              <span className="text-sm font-medium">{b.label}</span>
              <span className="font-mono text-[11px] tabular-nums text-stone-500">
                {card.intervals[b.rating]}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="font-mono text-[11px] text-stone-400">
        space reveals · 1 again · 2 hard · 3 good · 4 easy
      </p>
    </div>
  );
}
