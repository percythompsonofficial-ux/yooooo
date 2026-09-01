import Link from "next/link";
import { notFound } from "next/navigation";
import { GenerationProgress } from "@/components/study/GenerationProgress";
import { Markdown } from "@/components/study/Markdown";
import {
  assignLecture,
  regenerateNotes,
  retryLecture,
} from "@/app/study/actions";
import {
  getLecture,
  getNotes,
  listCards,
  listCourses,
  listSections,
} from "@/lib/study/db";
import { lectureProgress } from "@/lib/study/jobs";

export default async function LecturePage(
  props: PageProps<"/study/lectures/[id]">,
) {
  // params is a Promise in Next 16 — synchronous access was removed.
  const { id } = await props.params;

  const lecture = await getLecture(id);
  if (!lecture) notFound();

  const [sections, cards, notes, progress, courses] = await Promise.all([
    listSections(id),
    listCards(id),
    getNotes(id),
    lectureProgress(id),
    listCourses(),
  ]);

  const bySection = new Map<string, typeof cards>();
  for (const c of cards) {
    const list = bySection.get(c.section_id) ?? [];
    list.push(c);
    bySection.set(c.section_id, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href={`/study/courses/${lecture.course_id}`}
          className="font-mono text-xs uppercase tracking-widest text-stone-500 underline-offset-2 hover:text-teal-800 hover:underline"
        >
          {lecture.course_name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {lecture.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <form action={assignLecture} className="flex items-center gap-2">
            <input type="hidden" name="lectureId" value={id} />
            <label htmlFor="move" className="text-xs text-stone-500">
              Course
            </label>
            <select
              id="move"
              name="courseId"
              defaultValue={lecture.course_id}
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs outline-none focus-visible:border-teal-700"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Move
            </button>
          </form>

          {cards.length > 0 && (
            <a
              href={`/api/study/export?lectureId=${id}`}
              className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800"
            >
              Export to Anki
            </a>
          )}
        </div>
      </header>

      <GenerationProgress progress={progress} status={lecture.status} />

      {(lecture.status === "failed" || progress.failed > 0) && (
        <div className="flex items-center gap-3 rounded border border-red-300 bg-red-50 px-3 py-2.5">
          <p className="flex-1 text-sm text-red-900">
            {lecture.error ?? "Some generation jobs failed."}
          </p>
          <form action={retryLecture}>
            <input type="hidden" name="lectureId" value={id} />
            <button
              type="submit"
              className="rounded border border-red-400 bg-white px-2.5 py-1 text-xs font-medium text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Retry failed jobs
            </button>
          </form>
        </div>
      )}

      {notes && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
            <h2 className="text-lg font-semibold tracking-tight">Notes</h2>
            <form action={regenerateNotes}>
              <input type="hidden" name="lectureId" value={id} />
              <button
                type="submit"
                className="text-xs text-stone-500 underline underline-offset-2 transition-colors hover:text-teal-800"
              >
                Regenerate
              </button>
            </form>
          </div>
          <div className="rounded border border-stone-200 bg-white p-5 sm:p-6">
            <Markdown source={notes.body_md} />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-stone-200 pb-2 text-lg font-semibold tracking-tight">
          Sections{" "}
          <span className="font-mono text-sm font-normal text-stone-400 tabular-nums">
            {sections.length} · {cards.length} card{cards.length === 1 ? "" : "s"}
          </span>
        </h2>

        {sections.length === 0 ? (
          <p className="py-4 text-sm text-stone-500">
            No sections yet — the structure pass hasn&rsquo;t run.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {sections.map((s) => {
              const list = bySection.get(s.id) ?? [];
              return (
                <li
                  key={s.id}
                  className="rounded border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-teal-800 tabular-nums">
                      {String(s.ord).padStart(2, "0")}
                    </span>
                    <h3 className="font-medium">{s.heading}</h3>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{s.thesis}</p>

                  {list.length === 0 ? (
                    <p className="mt-3 font-mono text-[11px] text-stone-400">
                      no cards yet
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2.5 border-t border-stone-100 pt-3">
                      {list.map((c) => (
                        <li key={c.id} className="text-sm">
                          <p className="text-stone-800">{c.prompt}</p>
                          <p className="mt-0.5 text-stone-500">{c.answer}</p>
                          <details className="mt-1">
                            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-stone-400 hover:text-teal-800">
                              source
                            </summary>
                            <blockquote className="mt-1 border-l-2 border-stone-200 pl-2 text-xs italic text-stone-500">
                              {c.source_span}
                            </blockquote>
                          </details>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
