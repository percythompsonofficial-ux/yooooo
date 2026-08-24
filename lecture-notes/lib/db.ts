"use client";

import type { Lecture, LectureResult, Slide, TranscriptSegment } from "./types";
import type { LectureNotes } from "./notes-schema";

/**
 * Everything lives in the browser: audio, transcripts, notes.
 *
 * That is a deliberate choice rather than a shortcut. A recording of a lecture
 * is a recording of a person who did not sign up to be on someone's server, and
 * keeping it on the student's own device means the only copy of the professor's
 * voice is the one in their pocket. The server sees the audio exactly once, in
 * transit to the transcription API, and stores nothing.
 *
 * The cost of that choice is storage pressure — see `deleteAudio`, which drops
 * the audio for a lecture while keeping its notes and transcript.
 */

const DB_NAME = "lecture-notes";
// v2 added the slides store.
const DB_VERSION = 2;

const LECTURES = "lectures";
const CHUNKS = "chunks";
const AUDIO = "audio";
const RESULTS = "results";
const SLIDES = "slides";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(LECTURES)) {
        const store = db.createObjectStore(LECTURES, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(CHUNKS)) {
        // Compound key keeps chunks ordered by sequence within a lecture, which
        // matters — a Blob assembled out of order is silence and heartbreak.
        db.createObjectStore(CHUNKS, { keyPath: ["lectureId", "seq"] });
      }
      if (!db.objectStoreNames.contains(AUDIO)) {
        db.createObjectStore(AUDIO, { keyPath: "lectureId" });
      }
      if (!db.objectStoreNames.contains(RESULTS)) {
        db.createObjectStore(RESULTS, { keyPath: "lectureId" });
      }
      if (!db.objectStoreNames.contains(SLIDES)) {
        // Keyed by id rather than [lectureId, at] because two photos of the
        // same board a second apart are a normal thing to do.
        const store = db.createObjectStore(SLIDES, { keyPath: "id" });
        store.createIndex("lectureId", "lectureId");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function tx<T>(
  store: string | string[],
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore, t: IDBTransaction) => IDBRequest<T> | void,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const names = Array.isArray(store) ? store : [store];
        const t = db.transaction(names, mode);
        const req = fn(t.objectStore(names[0]), t);
        let result: T;
        if (req) req.onsuccess = () => (result = req.result);
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

/* ------------------------------------------------------------------ */
/* Lectures                                                            */
/* ------------------------------------------------------------------ */

export function newLectureId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createLecture(
  init: Pick<Lecture, "id" | "course" | "mimeType">,
): Promise<Lecture> {
  const lecture: Lecture = {
    ...init,
    title: "",
    createdAt: Date.now(),
    durationMs: 0,
    status: "recording",
    marks: [],
    chunkCount: 0,
    sizeBytes: 0,
    error: "",
  };
  await tx(LECTURES, "readwrite", (s) => s.put(lecture));
  return lecture;
}

export function getLecture(id: string): Promise<Lecture | undefined> {
  return tx<Lecture | undefined>(LECTURES, "readonly", (s) => s.get(id));
}

export async function listLectures(): Promise<Lecture[]> {
  const all = await tx<Lecture[]>(LECTURES, "readonly", (s) => s.getAll());
  return (all ?? []).sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateLecture(
  id: string,
  patch: Partial<Lecture>,
): Promise<Lecture | undefined> {
  const current = await getLecture(id);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  await tx(LECTURES, "readwrite", (s) => s.put(next));
  return next;
}

/* ------------------------------------------------------------------ */
/* Audio chunks                                                        */
/* ------------------------------------------------------------------ */

/**
 * Written every few seconds while recording. This is the crash insurance: if
 * the phone locks, the tab dies, or the battery gives out, everything up to the
 * last chunk is already on disk.
 */
export async function appendChunk(
  lectureId: string,
  seq: number,
  blob: Blob,
): Promise<void> {
  await tx(CHUNKS, "readwrite", (s) => s.put({ lectureId, seq, blob }));
}

async function getChunks(lectureId: string): Promise<Blob[]> {
  const rows = await tx<{ lectureId: string; seq: number; blob: Blob }[]>(
    CHUNKS,
    "readonly",
    (s) =>
      s.getAll(
        IDBKeyRange.bound([lectureId, -Infinity], [lectureId, Infinity]),
      ),
  );
  return (rows ?? []).sort((a, b) => a.seq - b.seq).map((r) => r.blob);
}

async function clearChunks(lectureId: string): Promise<void> {
  await tx(CHUNKS, "readwrite", (s) =>
    s.delete(
      IDBKeyRange.bound([lectureId, -Infinity], [lectureId, Infinity]),
    ),
  );
}

/**
 * Stitch the chunks into one blob and drop the pieces.
 *
 * Also used for recovery: an interrupted recording has chunks but never reached
 * this step, so calling it after the fact turns the wreckage into a playable
 * file.
 */
export async function finalizeAudio(
  lectureId: string,
  mimeType: string,
): Promise<Blob | null> {
  const chunks = await getChunks(lectureId);
  if (chunks.length === 0) return null;

  const blob = new Blob(chunks, { type: mimeType });
  await tx(AUDIO, "readwrite", (s) => s.put({ lectureId, blob }));
  await clearChunks(lectureId);
  await updateLecture(lectureId, {
    sizeBytes: blob.size,
    chunkCount: chunks.length,
  });
  return blob;
}

export async function getAudio(lectureId: string): Promise<Blob | null> {
  const row = await tx<{ lectureId: string; blob: Blob } | undefined>(
    AUDIO,
    "readonly",
    (s) => s.get(lectureId),
  );
  return row?.blob ?? null;
}

/** Free the space but keep the notes and transcript. */
export async function deleteAudio(lectureId: string): Promise<void> {
  await tx(AUDIO, "readwrite", (s) => s.delete(lectureId));
  await clearChunks(lectureId);
  await updateLecture(lectureId, { sizeBytes: 0 });
}

/* ------------------------------------------------------------------ */
/* Transcripts and notes                                               */
/* ------------------------------------------------------------------ */

export function getResult(
  lectureId: string,
): Promise<LectureResult | undefined> {
  return tx<LectureResult | undefined>(RESULTS, "readonly", (s) =>
    s.get(lectureId),
  );
}

export async function saveTranscript(
  lectureId: string,
  segments: TranscriptSegment[],
  provider: string,
): Promise<void> {
  const existing = await getResult(lectureId);
  const result: LectureResult = {
    lectureId,
    segments,
    notes: existing?.notes ?? null,
    transcribedAt: Date.now(),
    notedAt: existing?.notedAt ?? 0,
    provider,
  };
  await tx(RESULTS, "readwrite", (s) => s.put(result));
}

export async function saveNotes(
  lectureId: string,
  notes: LectureNotes,
): Promise<void> {
  const existing = await getResult(lectureId);
  const result: LectureResult = {
    lectureId,
    segments: existing?.segments ?? [],
    notes,
    transcribedAt: existing?.transcribedAt ?? 0,
    notedAt: Date.now(),
    provider: existing?.provider ?? "",
  };
  await tx(RESULTS, "readwrite", (s) => s.put(result));
}

/* ------------------------------------------------------------------ */
/* Slides                                                             */
/* ------------------------------------------------------------------ */

/**
 * Photos of the board or the projected slide, each pinned to the second it was
 * taken. Audio alone misses everything a professor writes down rather than
 * says, which is usually the half you actually need.
 */
export async function addSlide(
  lectureId: string,
  at: number,
  blob: Blob,
  width: number,
  height: number,
): Promise<Slide> {
  const slide: Slide = {
    id: `${lectureId}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    lectureId,
    at,
    blob,
    width,
    height,
    createdAt: Date.now(),
  };
  await tx(SLIDES, "readwrite", (s) => s.put(slide));
  return slide;
}

export async function listSlides(lectureId: string): Promise<Slide[]> {
  const rows = await tx<Slide[]>(SLIDES, "readonly", (s) =>
    s.index("lectureId").getAll(lectureId),
  );
  return (rows ?? []).sort((a, b) => a.at - b.at);
}

export async function deleteSlide(id: string): Promise<void> {
  await tx(SLIDES, "readwrite", (s) => s.delete(id));
}

async function clearSlides(lectureId: string): Promise<void> {
  const slides = await listSlides(lectureId);
  for (const slide of slides) await deleteSlide(slide.id);
}

/* ------------------------------------------------------------------ */
/* Housekeeping                                                        */
/* ------------------------------------------------------------------ */

export async function deleteLecture(lectureId: string): Promise<void> {
  await tx(LECTURES, "readwrite", (s) => s.delete(lectureId));
  await tx(RESULTS, "readwrite", (s) => s.delete(lectureId));
  await tx(AUDIO, "readwrite", (s) => s.delete(lectureId));
  await clearChunks(lectureId);
  await clearSlides(lectureId);
}

/**
 * Any lecture still marked `recording` on startup was interrupted — the phone
 * locked, the tab was killed, the browser crashed. Its chunks are still on disk.
 */
export async function findInterrupted(): Promise<Lecture[]> {
  const all = await listLectures();
  return all.filter((l) => l.status === "recording");
}

export async function storageEstimate(): Promise<{
  usedBytes: number;
  quotaBytes: number;
}> {
  if (!navigator.storage?.estimate) return { usedBytes: 0, quotaBytes: 0 };
  const est = await navigator.storage.estimate();
  return { usedBytes: est.usage ?? 0, quotaBytes: est.quota ?? 0 };
}

/**
 * Ask the browser not to evict this data under storage pressure. Without it,
 * IndexedDB is "best effort" and a browser low on space may quietly clear it.
 */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
