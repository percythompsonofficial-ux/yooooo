import type { TranscriptSegment } from "@/lib/types";
import { checkAuth } from "@/lib/auth";

/**
 * Audio in, timestamped transcript out.
 *
 * Two providers, because students already have whichever key they have.
 * Deepgram is the better fit — it takes hour-long files in one request and
 * labels speakers, which is what separates the professor from the person three
 * rows back asking about the midterm. Whisper is the fallback and caps uploads
 * at 25 MB, so a long lecture may not fit.
 *
 * Nothing is stored here. The audio passes through on its way to the provider
 * and is gone when the request ends.
 */

export const runtime = "nodejs";
// Transcribing an hour of audio is not a two-second request.
export const maxDuration = 300;

const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  // The URL is public even when the password isn't; these two routes are the
  // ones that spend money, so they check for themselves rather than trusting
  // that a page-level guard ran.
  const auth = await checkAuth();
  if (!auth.ok) {
    return Response.json(
      {
        error:
          auth.reason === "unconfigured"
            ? "This deployment has no APP_PASSWORD set."
            : "Not signed in. Reload the page and enter the password.",
      },
      { status: auth.reason === "unconfigured" ? 501 : 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Couldn't read the uploaded audio.");
  }

  const file = form.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return bad("No audio file in the request.");
  }

  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (deepgramKey) {
      const segments = await viaDeepgram(file, deepgramKey);
      return Response.json({ segments, provider: "deepgram" });
    }
    if (openaiKey) {
      if (file.size > WHISPER_MAX_BYTES) {
        return bad(
          `This recording is ${(file.size / 1024 / 1024).toFixed(1)} MB and ` +
            `Whisper only accepts 25 MB. Add a DEEPGRAM_API_KEY — it has no ` +
            `size limit and handles full lectures in one pass.`,
          413,
        );
      }
      const segments = await viaWhisper(file, openaiKey);
      return Response.json({ segments, provider: "openai-whisper" });
    }
    return bad(
      "No transcription key configured. Set DEEPGRAM_API_KEY (recommended) " +
        "or OPENAI_API_KEY — in .env.local locally, or as a secret on your host.",
      501,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return bad(message, 502);
  }
}

/* ------------------------------------------------------------------ */

type DeepgramUtterance = {
  start: number;
  end: number;
  transcript: string;
  speaker?: number;
};

async function viaDeepgram(
  file: File,
  key: string,
): Promise<TranscriptSegment[]> {
  const params = new URLSearchParams({
    model: "nova-3",
    smart_format: "true",
    punctuate: "true",
    paragraphs: "true",
    // Utterances give us sentence-level spans with a speaker attached, which is
    // exactly the granularity the notes prompt wants to cite.
    utterances: "true",
    diarize: "true",
  });

  const res = await fetch(
    `https://api.deepgram.com/v1/listen?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "Content-Type": file.type || "audio/webm",
      },
      body: file.stream(),
      // Streaming a body requires this in undici; without it the fetch throws.
      duplex: "half",
    } as RequestInit & { duplex: "half" },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Deepgram rejected the audio (${res.status}). ${detail.slice(0, 300)}`,
    );
  }

  const body = (await res.json()) as {
    results?: { utterances?: DeepgramUtterance[] };
  };
  const utterances = body.results?.utterances ?? [];

  return utterances
    .filter((u) => u.transcript.trim().length > 0)
    .map((u) => ({
      start: u.start,
      end: u.end,
      speaker: u.speaker === undefined ? "" : `Speaker ${u.speaker}`,
      text: u.transcript.trim(),
    }));
}

type WhisperSegment = { start: number; end: number; text: string };

async function viaWhisper(
  file: File,
  key: string,
): Promise<TranscriptSegment[]> {
  const form = new FormData();
  form.append("file", file);
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Whisper rejected the audio (${res.status}). ${detail.slice(0, 300)}`,
    );
  }

  const body = (await res.json()) as { segments?: WhisperSegment[] };
  return (body.segments ?? [])
    .filter((s) => s.text.trim().length > 0)
    .map((s) => ({
      start: s.start,
      end: s.end,
      // Whisper doesn't diarize, so every line is simply unattributed.
      speaker: "",
      text: s.text.trim(),
    }));
}
