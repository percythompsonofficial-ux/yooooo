import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { LectureNotesSchema } from "@/lib/notes-schema";
import type { Mark, TranscriptSegment } from "@/lib/types";

/**
 * Transcript (and any photos of the board) in, structured notes out.
 *
 * The value of this route is entirely in the prompt and the schema. A generic
 * "summarize this" produces a paragraph nobody studies from; what a student
 * needs is the professor's own definitions, the formulas as stated, and above
 * all the moments where the professor said what was going to be on the test.
 *
 * Photos matter because a lecture is only half spoken. Anything written on the
 * board and then referred to as "this" is invisible in a transcript, and a
 * single photo recovers it.
 */

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Roughly a five-hour lecture. Past this we stop rather than quietly cutting
 * the transcript off — silently dropping the back half of a class and calling
 * the result "notes" would be worse than failing.
 */
const MAX_TRANSCRIPT_CHARS = 600_000;

/** Every photo costs input tokens, so there is a point of diminishing returns. */
const MAX_SLIDES = 40;

const SYSTEM = `You turn a transcript of a university lecture into the notes a student would want to have taken.

WHAT YOU ARE READING
Each line is prefixed with the second it begins, in brackets: "[452] ...". Speaker labels, when present, come from automatic diarization and are not always right; the speaker with by far the most speech is the professor, and short interjections are usually students.

TIMESTAMPS
Every item you produce needs "at" — the bracketed second where that material was discussed. Take it from the bracket on the relevant line. Never invent or estimate a timestamp. These become buttons that replay the audio, so a wrong one sends the student to the wrong moment of a 75-minute recording.

SLIDE PHOTOS
The student may have photographed the board or the projected slides. Each photo is labelled with the second it was taken. These are the most valuable input you have, because a lecture is only half spoken: the professor writes a formula, then says "so this gives us that", and the transcript preserves nothing.

Use the photos to:
- Read out what was written, into board_content.
- Recover formulas and notation that were written but never said. Mark those with source "slide".
- Resolve garbled transcription. A photo showing "Kakutani" settles what the transcriber heard as "cocotini".

Two cautions. A photo is timestamped when it was taken, which is usually a little after the thing was written — use the surrounding transcript to place it correctly. And if part of a photo is blurred, glared out, or cut off, say so rather than guessing; a confidently invented formula is worse than an acknowledged gap.

FIDELITY
- Definitions must be the professor's, phrased the way they phrased it — not the textbook definition you already know.
- Put in "formulas" only what was stated aloud or is legible in a photo, and set "source" accordingly. If a formula was referenced but neither said nor shown, that belongs in open_questions. Never reconstruct one from your own knowledge.
- If the professor said something wrong or contradicted themselves, record what they said. The exam follows the professor.
- Empty arrays are correct and expected. A lecture with no assignments gets an empty assignments array; do not pad a section to make it look complete.

EXAM SIGNALS — the most valuable thing here
Professors telegraph exams constantly. Capture:
- Explicit flags: "this will be on the test", "know this cold", "I like asking about this".
- Repetition: an idea returned to three or four times.
- Disproportionate time: ten minutes on something that could have taken one.
- Emphasis language: "the key thing", "if you remember nothing else".
Mark confidence "explicit" only for a direct statement about an exam, "strong" for heavy repetition or emphasis, "possible" for a hunch. Quote what was actually said.

TRANSCRIPTION ERRORS
Speech-to-text mangles technical vocabulary, names, and notation — it will render "eigenvalue" as "Iron value" and "Nash equilibrium" as "gnash equilibrium". Use context, and the photos, to read through the garbling, and list the ones you had to guess at in suspected_mistranscriptions so the student can verify them. Do not silently correct a term you are unsure about.

STARRED MOMENTS
The student may have starred moments during class. Those are the parts they knew mattered while sitting there. Treat them as high signal: make sure whatever was being discussed at that second appears somewhere in the notes.

Write plainly and specifically. "The professor derived the result by differentiating both sides" beats "discussed a derivation".`;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

type Payload = {
  segments?: TranscriptSegment[];
  marks?: Mark[];
  course?: string;
  /** One entry per uploaded `slide` file, in the same order. */
  slides?: { at: number }[];
};

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return bad(
      "ANTHROPIC_API_KEY isn't set. Add it to .env.local and restart the server.",
      501,
    );
  }

  let payload: Payload;
  let slideFiles: File[] = [];

  try {
    const form = await request.formData();
    payload = JSON.parse(String(form.get("payload") ?? "{}")) as Payload;
    slideFiles = form.getAll("slide").filter((f): f is File => f instanceof File);
  } catch {
    return bad("Malformed request body.");
  }

  const segments = payload.segments ?? [];
  if (segments.length === 0) return bad("No transcript segments provided.");

  const transcript = segments
    .map((s) => {
      const who = s.speaker ? `${s.speaker}: ` : "";
      return `[${Math.round(s.start)}] ${who}${s.text}`;
    })
    .join("\n");

  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return bad(
      "This transcript is too long to process in one pass. Split the " +
        "recording and run the halves separately.",
      413,
    );
  }

  if (slideFiles.length > MAX_SLIDES) {
    return bad(
      `${slideFiles.length} photos is more than this can send in one request ` +
        `(the limit is ${MAX_SLIDES}). Delete the near-duplicates and retry.`,
      413,
    );
  }

  const marks = payload.marks ?? [];
  const starred = marks.length
    ? `\n\nThe student starred these moments during class (seconds): ${marks
        .map((m) => Math.round(m.at))
        .join(", ")}.`
    : "";

  const course = payload.course
    ? `\n\nThis is for a course the student labelled "${payload.course}".`
    : "";

  const content: Anthropic.ContentBlockParam[] = [
    {
      type: "text",
      text: `Here is the transcript of today's lecture.${course}${starred}\n\n<transcript>\n${transcript}\n</transcript>`,
    },
  ];

  if (slideFiles.length > 0) {
    const times = payload.slides ?? [];
    content.push({
      type: "text",
      text:
        `The student took ${slideFiles.length} photo(s) of the board or the ` +
        `projected slides during this lecture. Each is labelled with the ` +
        `second it was taken.`,
    });

    for (const [i, file] of slideFiles.entries()) {
      const at = Math.round(times[i]?.at ?? 0);
      const data = Buffer.from(await file.arrayBuffer()).toString("base64");
      content.push({ type: "text", text: `Photo taken at [${at}]:` });
      content.push({
        type: "image",
        source: {
          type: "base64",
          // Everything is normalised to JPEG on the way into storage.
          media_type: "image/jpeg",
          data,
        },
      });
    }
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: zodOutputFormat(LectureNotesSchema),
      },
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal") {
      return bad(
        "The model declined to process this recording. If that seems wrong, " +
          "check that the audio is what you think it is.",
        422,
      );
    }

    if (!response.parsed_output) {
      return bad(
        "The notes came back in an unexpected shape. Try running it again.",
        502,
      );
    }

    return Response.json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return bad("ANTHROPIC_API_KEY was rejected.", 401);
    }
    if (err instanceof Anthropic.RateLimitError) {
      return bad("Rate limited by the API — wait a moment and retry.", 429);
    }
    if (err instanceof Anthropic.APIError) {
      return bad(`The notes request failed: ${err.message}`, err.status ?? 502);
    }
    const message = err instanceof Error ? err.message : String(err);
    return bad(message, 500);
  }
}
