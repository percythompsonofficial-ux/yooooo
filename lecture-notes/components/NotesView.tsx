"use client";

import type { LectureNotes } from "@/lib/notes-schema";
import { stamp } from "@/lib/format";

/**
 * Every timestamp is a button. That's the point of the whole app: read a line
 * of notes, tap the time, hear the professor say it. Notes you can't check
 * against the source are just a summary.
 */
function Stamp({ at, onSeek }: { at: number; onSeek: (s: number) => void }) {
  return (
    <button
      onClick={() => onSeek(at)}
      title="Jump to this moment in the recording"
      className="shrink-0 self-start rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted transition-colors hover:bg-hairline hover:text-chalk"
    >
      {stamp(at)}
    </button>
  );
}

function Section({
  title,
  count,
  hint,
  children,
}: {
  title: string;
  count: number;
  hint?: string;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="border-t border-hairline pt-6">
      <h2 className="font-serif text-lg tracking-tight">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-faint">{hint}</p>}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function NotesView({
  notes,
  onSeek,
}: {
  notes: LectureNotes;
  onSeek: (seconds: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-[15px] leading-relaxed text-chalk/90">
          {notes.summary}
        </p>
      </section>

      <Section
        title="On the exam"
        count={notes.exam_signals.length}
        hint="Moments the professor flagged, repeated, or lingered on."
      >
        {notes.exam_signals.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-star/30 bg-star/5 p-3"
          >
            <div className="flex items-start gap-2">
              <Stamp at={item.at} onSeek={onSeek} />
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  item.confidence === "explicit"
                    ? "bg-star/25 text-star"
                    : "bg-panel-2 text-faint"
                }`}
              >
                {item.confidence}
              </span>
            </div>
            <p className="mt-2 font-serif text-[15px] italic leading-relaxed text-star/90">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {item.note}
            </p>
          </div>
        ))}
      </Section>

      <Section title="Key concepts" count={notes.key_concepts.length}>
        {notes.key_concepts.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <div>
              <h3 className="text-sm font-semibold">{item.term}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-chalk/85">
                {item.definition}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-faint">
                {item.why_it_matters}
              </p>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Formulas & results"
        count={notes.formulas.length}
        hint="Only what was stated aloud."
      >
        {notes.formulas.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <div className="min-w-0 flex-1">
              <pre className="overflow-x-auto rounded-lg border border-hairline bg-panel-2 px-3 py-2 font-mono text-sm text-chalk">
                {item.statement}
              </pre>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {item.notation_notes}
              </p>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Worked examples" count={notes.examples.length}>
        {notes.examples.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <div>
              <p className="text-sm leading-relaxed text-chalk/85">
                {item.description}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-faint">
                → {item.takeaway}
              </p>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Assignments & deadlines"
        count={notes.assignments.length}
        hint="Said out loud, so probably not on the syllabus."
      >
        {notes.assignments.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <p className="text-sm leading-relaxed">
              {item.what}
              {item.due && (
                <span className="ml-1.5 font-medium text-live">
                  ({item.due})
                </span>
              )}
            </p>
          </div>
        ))}
      </Section>

      <Section
        title="Look these up"
        count={notes.open_questions.length}
        hint="Referenced as known, never explained."
      >
        {notes.open_questions.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <p className="text-sm leading-relaxed text-chalk/85">
              {item.question}
            </p>
          </div>
        ))}
      </Section>

      <Section title="Questions from the room" count={notes.student_questions.length}>
        {notes.student_questions.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <div>
              <p className="text-sm font-medium leading-relaxed">
                {item.question}
              </p>
              {item.answer && (
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              )}
            </div>
          </div>
        ))}
      </Section>

      <Section title="The lecture in order" count={notes.outline.length}>
        {notes.outline.map((item, i) => (
          <div key={i} className="flex gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <div>
              <h3 className="text-sm font-semibold">{item.heading}</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {item.points.map((p, j) => (
                  <li
                    key={j}
                    className="text-sm leading-relaxed text-chalk/85 before:mr-1.5 before:text-faint before:content-['·']"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Check these words"
        count={notes.suspected_mistranscriptions.length}
        hint="Speech-to-text guesses at technical vocabulary. These are the guesses."
      >
        {notes.suspected_mistranscriptions.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2.5">
            <Stamp at={item.at} onSeek={onSeek} />
            <p className="text-sm leading-relaxed">
              <span className="text-faint line-through">{item.heard}</span>
              <span className="mx-1.5 text-faint">→</span>
              <span className="text-chalk">{item.likely}</span>
            </p>
          </div>
        ))}
      </Section>
    </div>
  );
}
