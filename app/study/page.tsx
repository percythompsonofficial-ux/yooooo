import Link from "next/link";
import { IngestForm } from "@/components/study/IngestForm";
import { LectureRow } from "@/components/study/LectureRow";
import { addCourse } from "@/app/study/actions";
import { listCourses, listLectures, queueCounts } from "@/lib/study/db";
import { progressByLecture } from "@/lib/study/jobs";
import type { Course } from "@/lib/study/db";
import type { LectureSummary } from "@/lib/study/types";

export default async function StudyHome() {
  let lectures: LectureSummary[] = [];
  let courses: Course[] = [];
  let progress = new Map<string, Awaited<ReturnType<typeof progressByLecture>> extends Map<string, infer V> ? V : never>();
  let due = 0;
  let reachable = true;

  try {
    [lectures, courses, progress, { due }] = await Promise.all([
      listLectures(),
      listCourses(),
      progressByLecture(),
      queueCounts(),
    ]);
  } catch {
    reachable = false;
  }

  const realCourses = courses.filter((c) => c.lecture_count > 0 || c.name !== "Unfiled");

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Add a lecture</h1>
        <p className="max-w-prose text-sm text-stone-600">
          Paste a transcript. You get back a section outline, revision notes, and
          recall cards for every section — each card carrying the verbatim line
          it came from.
        </p>
        <div className="mt-2">
          <IngestForm
            courses={courses.map((c) => ({ id: c.id, name: c.name, term: c.term }))}
          />
        </div>
      </section>

      {reachable && (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
              <h2 className="text-lg font-semibold tracking-tight">Courses</h2>
              {due > 0 && (
                <Link
                  href="/study/review"
                  className="text-sm font-medium text-teal-800 underline underline-offset-2"
                >
                  {due} card{due === 1 ? "" : "s"} due
                </Link>
              )}
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {realCourses.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/study/courses/${c.id}`}
                    className="flex flex-col gap-1 rounded border border-stone-200 bg-white p-3.5 transition-colors hover:border-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="font-mono text-xs text-stone-500 tabular-nums">
                      {c.term && `${c.term} · `}
                      {c.lecture_count} lecture{c.lecture_count === 1 ? "" : "s"} ·{" "}
                      {c.card_count} card{c.card_count === 1 ? "" : "s"}
                      {c.due_count > 0 && (
                        <span className="text-teal-800"> · {c.due_count} due</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <form action={addCourse} className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="course-name" className="text-xs text-stone-500">
                  New course
                </label>
                <input
                  id="course-name"
                  name="name"
                  required
                  placeholder="Organic Chemistry II"
                  className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none placeholder:text-stone-400 focus-visible:border-teal-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="course-term" className="text-xs text-stone-500">
                  Term
                </label>
                <input
                  id="course-term"
                  name="term"
                  placeholder="Fall 2026"
                  className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none placeholder:text-stone-400 focus-visible:border-teal-700"
                />
              </div>
              <button
                type="submit"
                className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Add
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="border-b border-stone-200 pb-2 text-lg font-semibold tracking-tight">
              All lectures
            </h2>
            {lectures.length === 0 ? (
              <p className="py-6 text-sm text-stone-500">
                Nothing yet. Paste a transcript above to get started.
              </p>
            ) : (
              <ul className="flex flex-col">
                {lectures.map((l) => (
                  <LectureRow
                    key={l.id}
                    lecture={l}
                    progress={progress.get(l.id)}
                    showCourse
                    returnTo="/study"
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
