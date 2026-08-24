"use client";

import { createLecture, newLectureId, putAudio, updateLecture } from "./db";

/**
 * Bringing in a recording made somewhere else — almost always Voice Memos.
 *
 * The phone's own recorder is more reliable than any browser will ever be: it
 * survives a locked screen, a phone call, and an hour in a bag. So the sane
 * workflow for a lecture you cannot afford to lose is to record it there and
 * import it afterwards, and this app should not pretend otherwise.
 */

/**
 * Browsers report duration lazily, and for some streamed containers report
 * `Infinity` until you seek past the end — a known quirk of webm and some m4a
 * files. Seeking to a huge offset forces the real value out.
 */
function probeDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    let settled = false;

    const done = (seconds: number) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) && seconds > 0 ? seconds : 0);
    };

    audio.onloadedmetadata = () => {
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          done(audio.duration);
        };
      } else {
        done(audio.duration);
      }
    };
    audio.onerror = () => done(0);
    // Don't hang forever on a container the browser can't parse; the duration
    // is cosmetic, and transcription doesn't need it.
    window.setTimeout(() => done(0), 8000);

    audio.preload = "metadata";
    audio.src = url;
  });
}

export async function importRecording(
  file: File,
  course: string,
): Promise<string> {
  if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
    throw new Error(
      "That doesn't look like an audio file. Voice Memos exports .m4a.",
    );
  }

  const id = newLectureId();
  await createLecture({ id, course, mimeType: file.type || "audio/mp4" });
  await putAudio(id, file);

  const seconds = await probeDuration(file);
  await updateLecture(id, {
    durationMs: Math.round(seconds * 1000),
    status: "recorded",
    // A file recorded elsewhere carries its own date; use it so the library
    // sorts by when the lecture happened, not when it was imported.
    createdAt: file.lastModified || Date.now(),
    title: file.name.replace(/\.[^.]+$/, ""),
  });

  return id;
}
