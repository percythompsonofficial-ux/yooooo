"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addSlide,
  createLecture,
  finalizeAudio,
  findInterrupted,
  newLectureId,
  requestPersistence,
  updateLecture,
} from "@/lib/db";
import { LectureRecorder, type RecorderState } from "@/lib/recorder";
import { hhmmss } from "@/lib/format";
import SlideCamera from "./SlideCamera";
import { importRecording } from "@/lib/import-audio";
import type { Lecture, Mark } from "@/lib/types";

const COURSE_KEY = "lecture-notes:last-course";

/** Safari on iOS is the one platform that will stop recording behind your back. */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports as a Mac; the touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function Recorder() {
  const router = useRouter();

  const [course, setCourse] = useState("");
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [savedThroughMs, setSavedThroughMs] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [interrupted, setInterrupted] = useState<Lecture[]>([]);
  const [showIOSWarning, setShowIOSWarning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [slideCount, setSlideCount] = useState(0);
  const [importing, setImporting] = useState(false);

  const recorderRef = useRef<LectureRecorder | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const lectureIdRef = useRef<string>("");

  useEffect(() => {
    setCourse(localStorage.getItem(COURSE_KEY) ?? "");
    setShowIOSWarning(isIOS());
    void findInterrupted().then(setInterrupted);
  }, []);

  /* ---------------------------------------------------------------- */

  const start = useCallback(async () => {
    setError("");
    try {
      // Ask before recording, not after: without this the browser may evict
      // an hour of audio the moment storage gets tight.
      await requestPersistence();

      const id = newLectureId();
      lectureIdRef.current = id;
      localStorage.setItem(COURSE_KEY, course);
      await createLecture({ id, course, mimeType: "" });

      const rec = new LectureRecorder(id, {
        onState: setState,
        onElapsed: setElapsed,
        onLevel: setLevel,
        onChunk: () => setSavedThroughMs(rec.elapsedMs()),
        onError: setError,
      });
      recorderRef.current = rec;

      setMarks([]);
      setSlideCount(0);
      setSavedThroughMs(0);
      await rec.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("Permission") || message.includes("denied")
          ? "Microphone access was denied. Allow it in your browser settings and try again."
          : message,
      );
      setState("idle");
    }
  }, [course]);

  const addMark = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    const mark: Mark = { at: rec.elapsedMs() / 1000, note: "" };
    const next = [...marks, mark];
    setMarks(next);
    // Persist immediately — a star is worthless if it dies with the tab.
    await updateLecture(lectureIdRef.current, { marks: next });
    if (navigator.vibrate) navigator.vibrate(20);
  }, [marks]);

  const runImport = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setImporting(true);
      setError("");
      try {
        localStorage.setItem(COURSE_KEY, course);
        const id = await importRecording(file, course);
        router.push(`/lectures/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setImporting(false);
        if (importRef.current) importRef.current.value = "";
      }
    },
    [course, router],
  );

  const captureSlide = useCallback(
    async (blob: Blob, width: number, height: number) => {
      const rec = recorderRef.current;
      if (!rec) return;
      await addSlide(
        lectureIdRef.current,
        rec.elapsedMs() / 1000,
        blob,
        width,
        height,
      );
      setSlideCount((n) => n + 1);
    },
    [],
  );

  const stop = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    setBusy("Saving the recording…");
    try {
      const durationMs = await rec.stop();
      const id = lectureIdRef.current;
      await finalizeAudio(id, rec.mimeType);
      await updateLecture(id, {
        durationMs,
        marks,
        status: "recorded",
      });
      setBusy("");
      router.push(`/lectures/${id}`);
    } catch (err) {
      setBusy("");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [marks, router]);

  /** Turn an interrupted recording's orphaned chunks into a playable lecture. */
  const recover = useCallback(async (lecture: Lecture) => {
    setBusy("Recovering…");
    try {
      const blob = await finalizeAudio(
        lecture.id,
        lecture.mimeType || "audio/webm",
      );
      if (!blob) {
        await updateLecture(lecture.id, {
          status: "error",
          error: "No audio was saved before the interruption.",
        });
      } else {
        await updateLecture(lecture.id, { status: "recorded" });
      }
      setBusy("");
      setInterrupted(await findInterrupted());
      if (blob) router.push(`/lectures/${lecture.id}`);
    } catch (err) {
      setBusy("");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [router]);

  // Leaving mid-recording is almost always an accident.
  useEffect(() => {
    if (state !== "recording" && state !== "paused") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);

  const live = state === "recording" || state === "paused";

  /* ---------------------------------------------------------------- */

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-8">
      {interrupted.length > 0 && !live && (
        <section className="rounded-xl border border-star/40 bg-star/5 p-4">
          <h2 className="text-sm font-semibold text-star">
            {interrupted.length === 1
              ? "A recording was interrupted"
              : `${interrupted.length} recordings were interrupted`}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The audio saved up to the moment it stopped is still here.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {interrupted.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => void recover(l)}
                  className="w-full rounded-lg border border-hairline bg-panel px-3 py-2 text-left text-xs transition-colors hover:border-star/60"
                >
                  <span className="font-medium">{l.course || "Untitled"}</span>
                  <span className="text-faint">
                    {" · "}
                    {new Date(l.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="ml-2 text-star">Recover</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!live && (
        <div>
          <label
            htmlFor="course"
            className="block text-xs font-medium uppercase tracking-wider text-faint"
          >
            Course
          </label>
          <input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. ECON 302"
            className="mt-2 w-full rounded-lg border border-hairline bg-panel px-3 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-faint"
          />
        </div>
      )}

      {/* The recording surface */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-hairline bg-panel px-5 py-10">
        <div className="flex h-8 items-center gap-2">
          {live ? (
            <>
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full bg-rec ${
                  state === "recording" ? "rec-dot" : "opacity-40"
                }`}
              />
              <span className="text-xs font-medium uppercase tracking-widest text-muted">
                {state === "recording" ? "Recording" : "Paused"}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium uppercase tracking-widest text-faint">
              Ready
            </span>
          )}
        </div>

        <div
          className="font-mono text-5xl tabular-nums tracking-tight"
          aria-live="off"
        >
          {hhmmss(elapsed)}
        </div>

        {/* Proof the microphone is hearing something. Silence here means a
            silent recording, and it's better to learn that now. */}
        <div
          className="flex h-10 items-end gap-1"
          role="img"
          aria-label={live ? "Microphone input level" : "Microphone idle"}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const threshold = (i + 1) / 24;
            const on = live && level >= threshold * 0.9;
            const height = 8 + Math.round(threshold * 28);
            return (
              <span
                key={i}
                style={{ height }}
                className={`w-1 rounded-full transition-colors duration-75 ${
                  on
                    ? threshold > 0.85
                      ? "bg-rec"
                      : "bg-live"
                    : "bg-hairline"
                }`}
              />
            );
          })}
        </div>

        {!live ? (
          <button
            onClick={() => void start()}
            disabled={busy !== ""}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-rec text-base font-semibold text-white shadow-lg shadow-rec/20 transition-transform active:scale-95 disabled:opacity-50"
          >
            Record
          </button>
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full gap-3">
              <button
                onClick={() => void addMark()}
                className="flex h-24 flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-star/50 bg-star/10 text-base font-semibold text-star transition-transform active:scale-[0.98]"
              >
                <span className="text-2xl">★</span>
                Mark this
                {marks.length > 0 && (
                  <span className="rounded-full bg-star/20 px-2 py-0.5 text-sm">
                    {marks.length}
                  </span>
                )}
              </button>

              {/* Opens a viewfinder inside the page rather than handing off to
                  the camera app, which would background the tab and cut the
                  recording short. */}
              <button
                onClick={() => setCameraOpen(true)}
                aria-label="Photograph the board"
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-hairline bg-panel-2 text-xs font-semibold text-muted transition-transform active:scale-[0.98]"
              >
                <CameraIcon />
                Slide
                {slideCount > 0 && (
                  <span className="rounded-full bg-hairline px-2 text-[11px] text-chalk">
                    {slideCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={() =>
                  state === "recording"
                    ? recorderRef.current?.pause()
                    : recorderRef.current?.resume()
                }
                className="flex-1 rounded-xl border border-hairline py-3 text-sm font-medium text-muted transition-colors hover:text-chalk"
              >
                {state === "recording" ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => void stop()}
                disabled={busy !== ""}
                className="flex-1 rounded-xl bg-chalk py-3 text-sm font-semibold text-ink transition-transform active:scale-95 disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {live && (
          <p className="text-center text-xs text-faint">
            Saved through {hhmmss(savedThroughMs)} — everything up to here is
            already on disk.
          </p>
        )}
      </section>

      {!live && (
        <div className="text-center">
          <button
            onClick={() => importRef.current?.click()}
            disabled={importing}
            className="text-xs font-medium text-muted underline decoration-hairline underline-offset-4 transition-colors hover:text-chalk disabled:opacity-50"
          >
            {importing
              ? "Importing…"
              : "Or import a recording from Voice Memos"}
          </button>
          <input
            ref={importRef}
            type="file"
            accept="audio/*,video/*,.m4a,.mp3,.wav,.aac"
            hidden
            onChange={(e) => void runImport(e.target.files)}
          />
        </div>
      )}

      {busy && <p className="text-center text-sm text-muted">{busy}</p>}

      {error && (
        <p className="rounded-lg border border-rec/40 bg-rec/10 px-3 py-2 text-sm text-rec">
          {error}
        </p>
      )}

      {showIOSWarning && !live && (
        <section className="rounded-xl border border-hairline bg-panel-2 p-4 text-xs leading-relaxed text-muted">
          <h2 className="mb-1 font-semibold text-chalk">
            Before your first lecture, on iPhone
          </h2>
          <p>
            Safari stops recording if you lock the screen or switch apps. This
            app holds the screen awake while recording, but that fails on Low
            Power Mode. Leave the phone face-up on the desk with this screen
            open, and turn Low Power Mode off.
          </p>
          <p className="mt-2">
            Audio is written to disk every five seconds, so even if it does get
            cut off you lose seconds, not the class — reopen this page and the
            recording will be waiting to be recovered.
          </p>
        </section>
      )}

      {cameraOpen && (
        <SlideCamera
          onCapture={captureSlide}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {!live && (
        <p className="text-center text-xs leading-relaxed text-faint">
          Recordings stay on this device. Ask your professor before recording —
          most say yes, and many schools require it.
        </p>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1 1 0 0 0 .83-.45l.94-1.4A1 1 0 0 1 9.3 4.7h5.4a1 1 0 0 1 .83.45l.94 1.4a1 1 0 0 0 .83.45h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="12.8" r="3.4" />
    </svg>
  );
}
