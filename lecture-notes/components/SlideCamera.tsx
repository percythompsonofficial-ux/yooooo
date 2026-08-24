"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * An in-page camera, used while a lecture is being recorded.
 *
 * The obvious implementation — `<input type="file" capture>` — hands off to the
 * system camera app, which backgrounds the page. On iOS that suspends the tab
 * and the microphone is handed to the camera, so taking a picture of the board
 * would end the recording. Keeping the viewfinder inside the page avoids the
 * app switch entirely; the audio stream is never touched.
 */

/** Matches the storage pipeline: nothing gains from more than this. */
const MAX_EDGE = 1568;

export default function SlideCamera({
  onCapture,
  onClose,
}: {
  onCapture: (blob: Blob, width: number, height: number) => Promise<void>;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [taken, setTaken] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        // Video only. Asking for audio here would contend with the recorder.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(
            "Couldn't open the camera. Check the site's camera permission.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const shoot = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const scale = Math.min(
      1,
      MAX_EDGE / Math.max(video.videoWidth, video.videoHeight),
    );
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob) return;

    setFlash(true);
    window.setTimeout(() => setFlash(false), 120);
    if (navigator.vibrate) navigator.vibrate(15);

    await onCapture(blob, width, height);
    setTaken((n) => n + 1);
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-contain"
        />
        {flash && <div className="absolute inset-0 bg-white/70" />}
        {!ready && !error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            Opening the camera…
          </p>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-rec">
            {error}
          </p>
        )}
        <p className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 text-center text-xs text-white/70">
          The lecture is still recording.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 py-6">
        <button
          onClick={onClose}
          className="w-20 text-left text-sm font-medium text-white/70"
        >
          Done
        </button>

        <button
          onClick={() => void shoot()}
          disabled={!ready}
          aria-label="Take a photo of the board"
          className="h-18 w-18 rounded-full border-4 border-white/80 bg-white/10 p-1 transition-transform active:scale-90 disabled:opacity-30"
        >
          <span className="block h-full w-full rounded-full bg-white" />
        </button>

        <span className="w-20 text-right text-sm tabular-nums text-white/70">
          {taken > 0 ? `${taken} taken` : ""}
        </span>
      </div>
    </div>
  );
}
