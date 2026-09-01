import Link from "next/link";
import { notFound } from "next/navigation";
import { LectureRow } from "@/components/study/LectureRow";
import { editCourse, removeCourse } from "@/app/study/actions";
import { getCourse, listLecturesForCourse } from "@/lib/study/db";
import { progressByLecture } from "@/lib/study/jobs";
import { UNFILED_COURSE_ID } from "@/lib/study/types";

export default async function CoursePage(
  props: PageProps<"/study/courses/[courseId]">,
) {
  const { courseId } = await props.params;

  const course = await getCourse(courseId);
  if (!course) notFound();

  const [lectures, progress] = await Promise.all([
    listLecturesForCourse(courseId),
    progressByLecture(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/study"
          className="font-mono text-xs uppercase tracking-widest text-stone-500 underline-offset-2 hover:text-teal-800 hover:underline"
        >
          All courses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {course.name}
        </h1>
        <p className="font-mono text-xs text-stone-500 tabular-nums">
          {course.term && `${course.term} · `}
          {course.lecture_count} lecture{course.lecture_count === 1 ? "" : "s"} ·{" "}
          {course.card_count} card{course.card_count === 1 ? "" : "s"}
          {course.due_count > 0 && (
            <span className="text-teal-800"> · {course.due_count} due</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {course.due_count > 0 && (
            <Link
              href="/study/review"
              className="rounded bg-teal-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Review {course.due_count} due
            </Link>
          )}
          {course.card_count > 0 && (
            <a
              href={`/api/study/export?courseId=${courseId}`}
              className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800"
            >
              Export {course.card_count} cards to Anki
            </a>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-stone-200 pb-2 text-lg font-semibold tracking-tight">
          Lectures
        </h2>
        {lectures.length === 0 ? (
          <p className="py-4 text-sm text-stone-500">
            No lectures in this course yet.{" "}
            <Link href="/study" className="text-teal-800 underline underline-offset-2">
              Add one
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col">
            {lectures.map((l) => (
              <LectureRow
                key={l.id}
                lecture={l}
                progress={progress.get(l.id)}
                returnTo={`/study/courses/${courseId}`}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-stone-200 pt-6">
        <h2 className="text-sm font-semibold tracking-tight text-stone-600">
          Course settings
        </h2>
        <form action={editCourse} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="courseId" value={courseId} />
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs text-stone-500">Name</label>
            <input
              id="name"
              name="name"
              defaultValue={course.name}
              required
              className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:border-teal-700"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="term" className="text-xs text-stone-500">Term</label>
            <input
              id="term"
              name="term"
              defaultValue={course.term}
              placeholder="Fall 2026"
              className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none placeholder:text-stone-400 focus-visible:border-teal-700"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Save
          </button>
        </form>

        {courseId !== UNFILED_COURSE_ID && (
          <form action={removeCourse}>
            <input type="hidden" name="courseId" value={courseId} />
            <button
              type="submit"
              className="text-xs text-stone-400 underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Delete this course and its {course.lecture_count} lecture
              {course.lecture_count === 1 ? "" : "s"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
