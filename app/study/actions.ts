"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  createLecture,
  deleteLecture,
  insertCards,
  replaceSections,
  setLectureStatus,
} from "@/lib/study/db";
import {
  generateCards,
  structureLecture,
  verifyGrounding,
} from "@/lib/study/generate";
import { applyReview, initialState } from "@/lib/study/scheduler";
import { RATINGS, type RatingValue } from "@/lib/study/types";

export type IngestResult =
  | { ok: true; lectureId: string; cards: number; dropped: number; sections: number }
  | { ok: false; error: string };

/**
 * Phase one: structure the lecture, then generate cards for the FIRST section
 * only. Two model calls, which comfortably fits a request. The full per-section
 * fan-out is phase two, and it must move to a background job first — a whole
 * lecture takes minutes and a serverless function will be killed partway,
 * leaving a half-generated lecture and no error.
 */
export async function ingestLecture(
  _prev: IngestResult | null,
  formData: FormData,
): Promise<IngestResult> {
  const transcript = String(formData.get("transcript") ?? "").trim();
  const givenTitle = String(formData.get("title") ?? "").trim();

  if (transcript.length < 200) {
    return {
      ok: false,
      error: "That transcript is very short — paste at least a few paragraphs.",
    };
  }

  let lectureId: string | null = null;
  try {
    lectureId = await createLecture(givenTitle || "Untitled lecture", transcript);

    await setLectureStatus(lectureId, "structuring");
    const structure = await structureLecture(transcript);

    const sections = await replaceSections(
      lectureId,
      structure.sections.map((s, i) => ({
        ord: i + 1,
        heading: s.heading,
        thesis: s.thesis,
      })),
    );
    if (sections.length === 0) {
      throw new Error("The structure pass found no sections in this transcript.");
    }

    await setLectureStatus(lectureId, "generating");
    const generated = await generateCards(transcript, sections[0]);
    const { kept, dropped } = verifyGrounding(transcript, generated);

    const written = await insertCards(
      lectureId,
      kept.map((c) => ({
        section_id: sections[0].id,
        kind: c.kind,
        prompt: c.prompt,
        answer: c.answer,
        distractors: c.kind === "mcq" && c.distractors.length ? c.distractors : null,
        source_span: c.source_span,
        difficulty: c.difficulty,
      })),
      initialState,
    );

    await setLectureStatus(lectureId, "ready");
    refresh();

    return {
      ok: true,
      lectureId,
      cards: written,
      dropped: dropped.length,
      sections: sections.length,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Generation failed.";
    if (lectureId) await setLectureStatus(lectureId, "failed", error);
    refresh();
    return { ok: false, error };
  }
}

export async function rateCard(cardId: string, rating: RatingValue, elapsedMs?: number) {
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
  if (id) await deleteLecture(id);
  refresh();
  redirect("/study");
}
