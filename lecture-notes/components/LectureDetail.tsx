"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addSlide,
  deleteAudio,
  deleteLecture,
  deleteSlide,
  getAudio,
  getLecture,
  getResult,
  listSlides,
} from "@/lib/db";
import { prepareSlide } from "@/lib/images";
import { processLecture } from "@/lib/pipeline";
import { bytes, hhmmss, relativeDate, stamp } from "@/lib/format";
import type { Lecture, LectureResult, Slide } from "@/lib/types";
import NotesView from "./NotesView";

type Tab = "notes" | "transcript" | "slides" | "starred";

export default function LectureDetail({ id }: { id: string }) {
  const router = useRouter();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [result, setResult] = useState<LectureResult | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [tab, setTab] = useState<Tab>("notes");
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideUrls, setSlideUrls] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    const l = await getLecture(id);
    setLecture(l ?? null);
    setResult((await getResult(id)) ?? null);
    setSlides(await listSlides(id));
    if (l?.error) setError(l.error);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Before anything is processed, Notes is an empty room — open on the photos.
  useEffect(() => {
    if (loading) return;
    if (!result?.notes && slides.length > 0) setTab("slides");
  }, [loading, result, slides.length]);

  // Object URLs leak if they aren't revoked, and an hour of audio is not small.
  useEffect(() => {
    let url = "";
    let cancelled = false;
    void getAudio(id).then((blob) => {
      if (!blob || cancelled) return;
      url = URL.createObjectURL(blob);
      setAudioUrl(url);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  useEffect(() => {
    const urls: Record<string, string> = {};
    for (const slide of slides) urls[slide.id] = URL.createObjectURL(slide.blob);
    setSlideUrls(urls);
    return () => {
      for (const url of Object.values(urls)) URL.revokeObjectURL(url);
    };
  }, [slides]);

  // Search results link straight to a moment: /lectures/<id>#t=452
  useEffect(() => {
    if (!audioUrl) return;
    const match = /(?:^|#|&)t=(\d+(?:\.\d+)?)/.exec(window.location.hash);
    if (!match) return;
    const el = audioRef.current;
    if (!el) return;
    const target = Number(match[1]);
    const apply = () => {
      el.currentTime = target;
    };
    // currentTime is ignored until the browser knows how long the file is.
    if (el.readyState >= 1) apply();
    else el.addEventListener("loadedmetadata", apply, { once: true });
  }, [audioUrl]);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = seconds;
    void el.play().catch(() => {
      // Autoplay can be refused; the scrub still happened.
    });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const run = useCallback(async () => {
    setError("");
    try {
      await processLecture(id, setStep);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStep("");
    }
  }, [id, load]);

  /**
   * Adding photos after class uses the ordinary file picker — safe here,
   * unlike during a recording, where handing off to the camera app would
   * background the tab.
   */
  const addPhotos = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setAdding(true);
      setError("");
      try {
        for (const file of Array.from(files)) {
          const prepared = await prepareSlide(file);
          // Photos added later have no moment of their own, so they land at
          // wherever the player is sitting — scrub to the right spot first.
          await addSlide(
            id,
            audioRef.current?.currentTime ?? 0,
            prepared.blob,
            prepared.width,
            prepared.height,
          );
        }
        setSlides(await listSlides(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setAdding(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [id],
  );

  const removeSlide = useCallback(
    async (slideId: string) => {
      await deleteSlide(slideId);
      setSlides(await listSlides(id));
    },
    [id],
  );

  const dropAudio = useCallback(async () => {
    if (
      !confirm(
        "Delete the audio and keep the notes and transcript? This frees the space but you won't be able to replay the professor.",
      )
    )
      return;
    await deleteAudio(id);
    setAudioUrl("");
    await load();
  }, [id, load]);

  const dropAll = useCallback(async () => {
    if (!confirm("Delete this lecture entirely — audio, transcript, notes?"))
      return;
    await deleteLecture(id);
    router.push("/lectures");
  }, [id, router]);

  if (loading) {
    return <p className="px-5 py-8 text-sm text-faint">Loading…</p>;
  }

  if (!lecture) {
    return (
      <p className="px-5 py-8 text-sm text-muted">
        That lecture isn&rsquo;t on this device.
      </p>
    );
  }

  const notes = result?.notes ?? null;
  const segments = result?.segments ?? [];
  const working = step !== "";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          {lecture.course || "No course"} · {relativeDate(lecture.createdAt)}
        </p>
        <h1 className="mt-1 font-serif text-2xl leading-tight tracking-tight">
          {lecture.title || notes?.title || "Untitled lecture"}
        </h1>
        <p className="mt-1 text-xs text-faint">
          {hhmmss(lecture.durationMs)}
          {lecture.sizeBytes > 0 && ` · ${bytes(lecture.sizeBytes)}`}
          {lecture.marks.length > 0 && ` · ${lecture.marks.length} starred`}
          {result?.provider && ` · ${result.provider}`}
        </p>
      </header>

      {audioUrl ? (
        <div className="flex flex-col gap-2">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            preload="metadata"
            onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
            className="w-full"
          />
          {/* Nobody reviews a lecture at 1x. Mobile browsers bury playback
              rate in a menu or omit it entirely, so it gets its own row. */}
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-[11px] uppercase tracking-wider text-faint">
              Speed
            </span>
            {[1, 1.25, 1.5, 1.75, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setSpeed(rate);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                }}
                className={`rounded px-2 py-1 font-mono text-[11px] tabular-nums transition-colors ${
                  speed === rate
                    ? "bg-chalk text-ink"
                    : "bg-panel text-muted hover:text-chalk"
                }`}
              >
                {rate}&times;
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-hairline bg-panel px-3 py-2 text-xs text-faint">
          The audio for this lecture has been deleted.
        </p>
      )}

      {!notes && (
        <button
          onClick={() => void run()}
          disabled={working || !audioUrl}
          className="rounded-xl bg-chalk py-3.5 text-sm font-semibold text-ink transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          {working
            ? step
            : segments.length > 0
              ? "Write the notes"
              : "Transcribe & write notes"}
        </button>
      )}

      {working && (
        <p className="text-center text-xs text-muted">
          This takes a couple of minutes for a full lecture. Leave the tab open.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-rec/40 bg-rec/10 px-3 py-2 text-sm leading-relaxed text-rec">
          {error}
        </p>
      )}

      {(notes || segments.length > 0 || slides.length > 0) && (
        <>
          <nav className="flex gap-1 border-b border-hairline">
            {(
              [
                // Slides is always offered: photos are worth adding before the
                // notes are written, not just after.
                ...(notes ? ([["notes", "Notes"]] as const) : []),
                ...(segments.length > 0
                  ? ([["transcript", "Transcript"]] as const)
                  : []),
                [
                  "slides",
                  `Slides${slides.length ? ` (${slides.length})` : ""}`,
                ],
                ...(lecture.marks.length > 0
                  ? ([
                      ["starred", `Starred (${lecture.marks.length})`],
                    ] as const)
                  : []),
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  tab === key
                    ? "border-chalk text-chalk"
                    : "border-transparent text-faint hover:text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {tab === "notes" &&
            (notes ? (
              <NotesView notes={notes} onSeek={seek} slides={slides} slideUrls={slideUrls} />
            ) : (
              <p className="text-sm text-faint">
                Transcribed, but the notes haven&rsquo;t been written yet.
              </p>
            ))}

          {tab === "transcript" && (
            <div className="flex flex-col gap-2">
              {segments.map((s, i) => {
                const active = now >= s.start && now < s.end;
                return (
                  <button
                    key={i}
                    onClick={() => seek(s.start)}
                    className={`flex gap-2.5 rounded px-2 py-1.5 text-left transition-colors ${
                      active ? "bg-panel-2" : "hover:bg-panel"
                    }`}
                  >
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-faint">
                      {stamp(s.start)}
                    </span>
                    <span className="text-sm leading-relaxed text-chalk/85">
                      {s.speaker && (
                        <span className="mr-1.5 text-xs font-medium text-faint">
                          {s.speaker}
                        </span>
                      )}
                      {s.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "slides" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-relaxed text-faint">
                  Photos of the board, each pinned to a moment. These are read
                  alongside the transcript when the notes are written.
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={adding}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-faint hover:text-chalk disabled:opacity-40"
                >
                  {adding ? "Adding…" : "Add photos"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => void addPhotos(e.target.files)}
                />
              </div>

              {slides.length === 0 ? (
                <p className="text-sm text-faint">
                  No photos yet. Anything the professor wrote rather than said
                  is invisible to the transcript — a photo is what recovers it.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3">
                  {slides.map((slide) => (
                    <li key={slide.id} className="flex flex-col gap-1">
                      <button
                        onClick={() => seek(slide.at)}
                        className="overflow-hidden rounded-lg border border-hairline transition-colors hover:border-faint"
                        title="Jump to when this was taken"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slideUrls[slide.id]}
                          alt={`Board at ${stamp(slide.at)}`}
                          width={slide.width}
                          height={slide.height}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <div className="flex items-center justify-between px-0.5">
                        <span className="font-mono text-[11px] tabular-nums text-faint">
                          {stamp(slide.at)}
                        </span>
                        <button
                          onClick={() => void removeSlide(slide.id)}
                          className="text-[11px] text-faint transition-colors hover:text-rec"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "starred" && (
            <div className="flex flex-col gap-2">
              {lecture.marks.length === 0 ? (
                <p className="text-sm text-faint">
                  Nothing starred in this lecture.
                </p>
              ) : (
                lecture.marks.map((m, i) => {
                  // Show what was being said when the star was dropped.
                  const around = segments.find(
                    (s) => s.end >= m.at - 5 && s.start <= m.at + 5,
                  );
                  return (
                    <button
                      key={i}
                      onClick={() => seek(Math.max(0, m.at - 8))}
                      className="flex gap-2.5 rounded border border-star/25 bg-star/5 px-3 py-2 text-left transition-colors hover:border-star/50"
                    >
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-star">
                        {stamp(m.at)}
                      </span>
                      <span className="text-sm leading-relaxed text-chalk/85">
                        {around?.text ?? "—"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      <footer className="mt-4 flex gap-4 border-t border-hairline pt-4 text-xs">
        {audioUrl && notes && (
          <button
            onClick={() => void dropAudio()}
            className="text-faint transition-colors hover:text-muted"
          >
            Delete audio, keep notes
          </button>
        )}
        <button
          onClick={() => void dropAll()}
          className="text-faint transition-colors hover:text-rec"
        >
          Delete lecture
        </button>
      </footer>
    </div>
  );
}
