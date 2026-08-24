"use client";

import { getAudio, getLecture, saveNotes, saveTranscript, updateLecture } from "./db";
import type { LectureNotes } from "./notes-schema";
import type { TranscribeResponse } from "./types";

/**
 * Audio in, notes out. Kept on the client so the browser owns the sequence and
 * can resume it: a lecture that transcribed fine but failed at the notes step
 * doesn't get re-uploaded, it picks up where it stopped.
 */

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) return body.error;
  } catch {
    // fall through to the status line
  }
  return `Request failed (${res.status})`;
}

export async function transcribeLecture(lectureId: string): Promise<void> {
  const lecture = await getLecture(lectureId);
  if (!lecture) throw new Error("Lecture not found.");

  const audio = await getAudio(lectureId);
  if (!audio) throw new Error("No audio saved for this lecture.");

  await updateLecture(lectureId, { status: "transcribing", error: "" });

  const form = new FormData();
  const ext = lecture.mimeType.includes("mp4") ? "m4a" : "webm";
  form.append("audio", audio, `${lectureId}.${ext}`);

  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));

  const data = (await res.json()) as TranscribeResponse;
  if (!data.segments?.length) {
    throw new Error(
      "The transcript came back empty — the recording may be silent. " +
        "Play it back before spending another call on it.",
    );
  }

  await saveTranscript(lectureId, data.segments, data.provider);
  await updateLecture(lectureId, { status: "transcribed" });
}

export async function generateNotes(lectureId: string): Promise<void> {
  const lecture = await getLecture(lectureId);
  if (!lecture) throw new Error("Lecture not found.");

  const { getResult } = await import("./db");
  const result = await getResult(lectureId);
  if (!result?.segments?.length) throw new Error("No transcript to work from.");

  await updateLecture(lectureId, { status: "noting", error: "" });

  // Photos of the board go up alongside the transcript. Multipart rather than
  // JSON so the images travel as bytes instead of inflating 33% as base64.
  const { listSlides } = await import("./db");
  const slides = await listSlides(lectureId);

  const form = new FormData();
  form.append(
    "payload",
    JSON.stringify({
      segments: result.segments,
      marks: lecture.marks,
      course: lecture.course,
      slides: slides.map((s) => ({ at: s.at })),
    }),
  );
  for (const slide of slides) {
    form.append("slide", slide.blob, `${slide.id}.jpg`);
  }

  const res = await fetch("/api/notes", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));

  const notes = (await res.json()) as LectureNotes;
  await saveNotes(lectureId, notes);
  await updateLecture(lectureId, {
    status: "done",
    // The recorder never knew what the lecture was about; the notes do.
    title: lecture.title || notes.title,
  });
}

/** The whole way through, resuming from wherever it last got to. */
export async function processLecture(
  lectureId: string,
  onStep?: (step: string) => void,
): Promise<void> {
  try {
    const lecture = await getLecture(lectureId);
    const { getResult } = await import("./db");
    const existing = await getResult(lectureId);

    const needsTranscript = !existing?.segments?.length;
    if (needsTranscript) {
      onStep?.("Transcribing the recording…");
      await transcribeLecture(lectureId);
    }

    onStep?.("Reading it through and writing notes…");
    await generateNotes(lectureId);
    onStep?.("");

    if (!lecture) return;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateLecture(lectureId, { status: "error", error: message });
    throw err;
  }
}
