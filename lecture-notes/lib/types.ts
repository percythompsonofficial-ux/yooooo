import type { LectureNotes } from "./notes-schema";

export type LectureStatus =
  | "recording" // in progress, or interrupted mid-recording
  | "recorded" // audio complete, nothing processed yet
  | "transcribing"
  | "transcribed"
  | "noting"
  | "done"
  | "error";

/** A star the student dropped while the professor was mid-sentence. */
export type Mark = {
  /** Seconds from the start of the recording. */
  at: number;
  note: string;
};

export type TranscriptSegment = {
  /** Seconds from the start of the recording. */
  start: number;
  end: number;
  /** Diarization label, when the provider gives us one. */
  speaker: string;
  text: string;
};

/** A photo of the board or a projected slide, pinned to a moment in the audio. */
export type Slide = {
  id: string;
  lectureId: string;
  /** Seconds from the start of the recording. */
  at: number;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
};

export type Lecture = {
  id: string;
  course: string;
  title: string;
  createdAt: number;
  /** Milliseconds of audio captured. */
  durationMs: number;
  status: LectureStatus;
  marks: Mark[];
  mimeType: string;
  /** Number of chunks written, so recovery knows what to look for. */
  chunkCount: number;
  /** Populated once the audio is stitched together and no longer chunked. */
  sizeBytes: number;
  error: string;
};

export type LectureResult = {
  lectureId: string;
  segments: TranscriptSegment[];
  notes: LectureNotes | null;
  transcribedAt: number;
  notedAt: number;
  /** Which service produced the transcript, for the record. */
  provider: string;
};

export type TranscribeResponse = {
  segments: TranscriptSegment[];
  provider: string;
};
