"use client";

import { appendChunk, updateLecture } from "./db";

/**
 * A recorder built on the assumption that it *will* be interrupted.
 *
 * Phones lock. Tabs get evicted. Someone calls in the middle of a lecture. So
 * audio is flushed to IndexedDB every few seconds rather than accumulated in
 * memory and written at the end — the difference between losing four seconds
 * and losing an hour of a class you can't attend twice.
 */

/** How often MediaRecorder hands us a blob to persist. */
const CHUNK_MS = 5000;

/**
 * 48 kbps mono is the sweet spot for a lectern voice at ten metres: still clean
 * enough for speech-to-text, and about 22 MB an hour. Worth knowing if you use
 * OpenAI Whisper, which rejects uploads over 25 MB — Deepgram has no such cap.
 */
const AUDIO_BITRATE = 48000;

export type RecorderState = "idle" | "recording" | "paused" | "stopped";

export type RecorderEvents = {
  onState: (state: RecorderState) => void;
  onElapsed: (ms: number) => void;
  /** 0..1 input level, for the meter that proves the mic is actually hearing. */
  onLevel: (level: number) => void;
  onChunk: (seq: number, bytes: number) => void;
  onError: (message: string) => void;
};

/**
 * Safari speaks mp4; everything else speaks webm/opus. Pick what the browser
 * admits to supporting rather than assuming, and remember the answer — the
 * container has to match when the chunks are stitched back together.
 */
export function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return ""; // let the browser choose
}

export class LectureRecorder {
  private lectureId: string;
  private events: RecorderEvents;

  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private wakeLock: WakeLockSentinel | null = null;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private levelRaf = 0;

  private seq = 0;
  private startedAt = 0;
  private accumulatedMs = 0;
  private tick = 0;

  mimeType = "";
  state: RecorderState = "idle";

  constructor(lectureId: string, events: RecorderEvents) {
    this.lectureId = lectureId;
    this.events = events;
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "This browser can't record audio. Try Safari on iOS or Chrome on Android.",
      );
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        // Echo cancellation and noise suppression are tuned for a phone held
        // against your face on a call. Pointed at a lecture hall they treat a
        // distant, steady voice as background and gate it out. Automatic gain
        // stays on — it's what rescues a quiet professor.
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
    });

    this.mimeType = pickMimeType();
    this.recorder = new MediaRecorder(this.stream, {
      ...(this.mimeType ? { mimeType: this.mimeType } : {}),
      audioBitsPerSecond: AUDIO_BITRATE,
    });
    // The browser may pick something other than what we asked for.
    this.mimeType = this.recorder.mimeType || this.mimeType || "audio/webm";

    this.recorder.ondataavailable = (e) => {
      if (!e.data || e.data.size === 0) return;
      const seq = this.seq++;
      // Fire and forget: a slow disk write must never stall the recorder.
      void appendChunk(this.lectureId, seq, e.data)
        .then(() => this.events.onChunk(seq, e.data.size))
        .catch(() =>
          this.events.onError(
            "Couldn't save a piece of the recording — device storage may be full.",
          ),
        );
    };

    this.recorder.onerror = () => {
      this.events.onError("The recorder stopped unexpectedly.");
    };

    // If another app seizes the microphone, the track ends and we would
    // otherwise keep "recording" silence forever.
    this.stream.getAudioTracks().forEach((track) => {
      track.onended = () => {
        this.events.onError("The microphone was taken over by something else.");
        void this.stop();
      };
    });

    this.startMeter();
    await this.acquireWakeLock();
    document.addEventListener("visibilitychange", this.onVisibility);

    this.recorder.start(CHUNK_MS);
    this.startedAt = Date.now();
    this.accumulatedMs = 0;
    this.setState("recording");
    this.startTicking();

    await updateLecture(this.lectureId, {
      mimeType: this.mimeType,
      status: "recording",
    });
  }

  pause(): void {
    if (!this.recorder || this.state !== "recording") return;
    this.recorder.pause();
    this.accumulatedMs += Date.now() - this.startedAt;
    this.setState("paused");
    this.stopTicking();
  }

  resume(): void {
    if (!this.recorder || this.state !== "paused") return;
    this.recorder.resume();
    this.startedAt = Date.now();
    this.setState("recording");
    this.startTicking();
    void this.acquireWakeLock();
  }

  /** Milliseconds of audio captured so far, not counting paused time. */
  elapsedMs(): number {
    if (this.state === "recording") {
      return this.accumulatedMs + (Date.now() - this.startedAt);
    }
    return this.accumulatedMs;
  }

  async stop(): Promise<number> {
    if (this.state === "recording") {
      this.accumulatedMs += Date.now() - this.startedAt;
    }
    this.stopTicking();

    if (this.recorder && this.recorder.state !== "inactive") {
      // Wait for the final chunk to land before tearing anything down.
      await new Promise<void>((resolve) => {
        const rec = this.recorder!;
        rec.onstop = () => resolve();
        rec.stop();
      });
    }

    this.teardown();
    this.setState("stopped");
    return this.accumulatedMs;
  }

  /* ---------------------------------------------------------------- */

  private setState(state: RecorderState) {
    this.state = state;
    this.events.onState(state);
  }

  private startTicking() {
    this.stopTicking();
    this.tick = window.setInterval(
      () => this.events.onElapsed(this.elapsedMs()),
      250,
    );
  }

  private stopTicking() {
    if (this.tick) window.clearInterval(this.tick);
    this.tick = 0;
  }

  /**
   * A live level meter is not decoration. The classic failure is recording a
   * full lecture through a muted or blocked microphone and finding out at
   * midnight; a moving bar is the only proof that sound is arriving.
   */
  private startMeter() {
    if (!this.stream) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    this.audioCtx = new Ctx();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    source.connect(this.analyser);

    const buf = new Uint8Array(this.analyser.fftSize);
    const read = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = Math.abs(buf[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      // Speech peaks low; a square root curve makes a quiet room readable.
      this.events.onLevel(Math.min(1, Math.sqrt(peak) * 1.4));
      this.levelRaf = requestAnimationFrame(read);
    };
    read();
  }

  private async acquireWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
    } catch {
      // Denied (often a low-battery mode). The recording still runs; the
      // screen just may sleep, which is exactly what the UI warns about.
    }
  }

  /**
   * Wake locks are released whenever the page is hidden, and are not restored
   * automatically. Re-acquiring on return is what keeps a long lecture alive
   * after a glance at a notification.
   */
  private onVisibility = () => {
    if (document.visibilityState === "visible" && this.state === "recording") {
      void this.acquireWakeLock();
    }
  };

  private teardown() {
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.levelRaf) cancelAnimationFrame(this.levelRaf);
    this.levelRaf = 0;
    this.analyser = null;
    void this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.wakeLock?.release().catch(() => {});
    this.wakeLock = null;
    this.recorder = null;
  }
}
