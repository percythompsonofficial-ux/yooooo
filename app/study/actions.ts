"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCourse,
  createLecture,
  deleteCourse,
  deleteLecture,
  moveLecture,
  renameCourse,
} from "@/lib/study/db";
import { enqueue, retryFailed } from "@/lib/study/jobs";
import { applyReview } from "@/lib/study/scheduler";
import { syncLectureStatus } from "@/lib/study/runner";
import { RATINGS, UNFILED_COURSE_ID, type RatingValue } from "@/lib/study/types";

export type IngestResult =
  | { ok: true; lectureId: string }
  | { ok: false; error: string };

/**
 * Creates the lecture and queues the work, then returns. Generation runs in
 * the worker (`/api/jobs/run`), because a full lecture is many model calls
 * over several minutes and a request would be killed partway through,
 * leaving a half-generated lecture and no error to show for it.
 */
export async function ingestLecture(
  _prev: IngestResult | null,
  formData: FormData,
): Promise<IngestResult> {
  const transcript = String(formData.get("transcript") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "") || UNFILED_COURSE_ID;

  if (transcript.length < 200) {
    return {
      ok: false,
      error: "That transcript is very short — paste at least a few paragraphs.",
    };
  }

  try {
    const lectureId = await createLecture(
      title || "Untitled lecture",
      transcript,
      courseId,
    );
    await enqueue(lectureId, "structure");
    await syncLectureStatus(lectureId);
    refresh();
    return { ok: true, lectureId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not queue this lecture.",
    };
  }
}

export async function rateCard(
  cardId: string,
  rating: RatingValue,
  elapsedMs?: number,
) {
  const valid = Object.values(RATINGS).includes(rating);
  if (!valid) throw new Error(`Invalid rating: ${rating}`);
  const outcome = await applyReview(cardId, rating, elapsedMs);
  // Deliberately no refresh() here. A review session walks a snapshot of the
  // queue taken when the page loaded; refreshing mid-session re-runs the
  // server component, hands the client a shorter array, and the index then
  // points past cards that were never shown. The session refreshes once, on
  // its way out, so the nav count and lecture list are right when you land.
  return { due: outcome.due.toISOString(), interval: outcome.interval };
}

export async function removeLecture(formData: FormData) {
  const id = String(formData.get("lectureId") ?? "");
  const back = String(formData.get("returnTo") ?? "/study");
  if (id) await deleteLecture(id);
  refresh();
  redirect(back);
}

/* ------------------------------------------------------------------ */
/* generation control                                                  */
/* ------------------------------------------------------------------ */

export async function retryLecture(formData: FormData) {
  const id = String(formData.get("lectureId") ?? "");
  if (!id) return;
  const n = await retryFailed(id);
  // Nothing failed but the user asked again — re-run from the top.
  if (n === 0) await enqueue(id, "structure");
  await syncLectureStatus(id);
  refresh();
}

export async function regenerateNotes(formData: FormData) {
  const id = String(formData.get("lectureId") ?? "");
  if (!id) return;
  await enqueue(id, "notes");
  await syncLectureStatus(id);
  refresh();
}

/* ------------------------------------------------------------------ */
/* courses                                                             */
/* ------------------------------------------------------------------ */

export async function addCourse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  if (!name) return;
  const id = await createCourse(name, term);
  refresh();
  redirect(`/study/courses/${id}`);
}

export async function editCourse(formData: FormData) {
  const id = String(formData.get("courseId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  if (!id || !name) return;
  await renameCourse(id, name, term);
  refresh();
}

export async function removeCourse(formData: FormData) {
  const id = String(formData.get("courseId") ?? "");
  if (!id) return;
  await deleteCourse(id);
  refresh();
  redirect("/study");
}

export async function assignLecture(formData: FormData) {
  const lectureId = String(formData.get("lectureId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!lectureId || !courseId) return;
  await moveLecture(lectureId, courseId);
  refresh();
}
