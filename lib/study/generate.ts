import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod";
import type { CardKind } from "./types";

export const MODEL = "claude-opus-5";

const globalForAnthropic = globalThis as unknown as { studyClient?: Anthropic };

function client(): Anthropic {
  if (!globalForAnthropic.studyClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to generate cards.",
      );
    }
    globalForAnthropic.studyClient = new Anthropic();
  }
  return globalForAnthropic.studyClient;
}

/**
 * The transcript, as a cached system block. Every call in a lecture's
 * generation run sends this byte-identical prefix, so it is billed at the
 * write rate once and read at roughly a tenth of that thereafter.
 *
 * Caching is a prefix match over tools -> system -> messages, so anything
 * that varies per call (the section, the instruction) must live in
 * `messages`, never here.
 */
function cachedTranscript(transcript: string) {
  return [
    {
      type: "text" as const,
      text: `You are helping a college student study from a lecture transcript.\n\n<transcript>\n${transcript}\n</transcript>`,
      cache_control: { type: "ephemeral" as const, ttl: "1h" as const },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* structure pass                                                      */
/* ------------------------------------------------------------------ */

const StructureSchema = z.object({
  title: z
    .string()
    .describe("A short, specific title for this lecture, 3-8 words."),
  sections: z
    .array(
      z.object({
        heading: z.string().describe("A short heading, 2-6 words."),
        thesis: z
          .string()
          .describe("One sentence: the claim or idea this section establishes."),
      }),
    )
    .describe("The lecture broken into 4-10 sequential sections."),
});

export type Structure = z.infer<typeof StructureSchema>;

export async function structureLecture(transcript: string): Promise<Structure> {
  const message = await client().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    output_config: {
      format: zodOutputFormat(StructureSchema),
      effort: "high",
    },
    system: cachedTranscript(transcript),
    messages: [
      {
        role: "user",
        content:
          "Break this lecture into its sequential sections — the natural units a " +
          "student would revise one at a time. Aim for 4 to 10. Each section " +
          "needs a heading and a one-sentence thesis stating what it establishes. " +
          "Follow the lecture's own order. Do not invent material that is not in " +
          "the transcript.",
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Structure pass returned no parseable output.");
  }
  return message.parsed_output;
}

/* ------------------------------------------------------------------ */
/* card pass                                                           */
/* ------------------------------------------------------------------ */

const CardsSchema = z.object({
  cards: z
    .array(
      z.object({
        kind: z.enum(["recall", "mcq", "cloze"]),
        prompt: z.string().describe("The question, as the student will see it."),
        answer: z.string().describe("The correct answer, one or two sentences."),
        distractors: z
          .array(z.string())
          .describe(
            "For kind 'mcq', exactly 3 plausible wrong options. Empty array otherwise.",
          ),
        source_span: z
          .string()
          .describe(
            "A short quote copied VERBATIM from the transcript that this card tests. " +
              "Must appear in the transcript character for character.",
          ),
        difficulty: z
          .number()
          .int()
          .min(1)
          .max(3)
          .describe("1 easy recall, 2 typical, 3 demanding."),
      }),
    )
    .describe("Between 3 and 5 cards. Never more than 5."),
});

export type GeneratedCard = z.infer<typeof CardsSchema>["cards"][number];

/**
 * Cards for ONE section. Called once per section, in parallel, all sharing
 * the cached transcript above.
 *
 * Asking for a whole lecture's cards in a single call is the tempting
 * shortcut and it degrades badly: past roughly a dozen the model starts
 * rephrasing earlier cards rather than covering new ground.
 */
export async function generateCards(
  transcript: string,
  section: { heading: string; thesis: string },
  courseName?: string,
): Promise<GeneratedCard[]> {
  const context = courseName ? ` from a course on ${courseName}` : "";
  const message = await client().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    output_config: {
      format: zodOutputFormat(CardsSchema),
      effort: "medium",
    },
    system: cachedTranscript(transcript),
    messages: [
      {
        role: "user",
        content:
          `Write spaced-repetition cards for one section of this lecture${context}.\n\n` +
          `Section: ${section.heading}\n` +
          `What it establishes: ${section.thesis}\n\n` +
          "Rules:\n" +
          "- 3 to 5 cards. Fewer good cards beats more weak ones.\n" +
          "- Each card tests exactly one fact. No compound questions — the " +
          "student rates recall with a single button and cannot rate 'half right'.\n" +
          "- The question must not contain its own answer, and must not be " +
          "answerable from its wording alone by someone who never attended.\n" +
          "- Cover different points within the section. Do not rephrase the " +
          "same fact twice.\n" +
          "- source_span must be copied verbatim from the transcript. Cards " +
          "whose span is not found in the transcript are discarded.\n" +
          "- Use 'mcq' only where plausible wrong answers genuinely exist; " +
          "prefer 'recall' otherwise.",
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error(`Card pass for "${section.heading}" returned no parseable output.`);
  }
  return message.parsed_output.cards;
}

/* ------------------------------------------------------------------ */
/* grounding check                                                     */
/* ------------------------------------------------------------------ */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export type Grounded = {
  kept: (GeneratedCard & { kind: CardKind })[];
  dropped: { prompt: string; source_span: string }[];
};

/**
 * Drops any card whose source_span is not actually in the transcript.
 *
 * This is the cheapest useful check in the pipeline: it catches a
 * well-formed, plausible question about something the lecturer never said,
 * which is the failure mode that matters when you are about to memorise the
 * output. Whitespace and smart quotes are normalised first, because the
 * model reproduces those inconsistently and they are not what we are testing.
 */
export function verifyGrounding(
  transcript: string,
  cards: GeneratedCard[],
): Grounded {
  const haystack = normalize(transcript);
  const kept: Grounded["kept"] = [];
  const dropped: Grounded["dropped"] = [];

  for (const card of cards) {
    const span = normalize(card.source_span);
    if (span.length >= 8 && haystack.includes(span)) {
      kept.push(card as GeneratedCard & { kind: CardKind });
    } else {
      dropped.push({ prompt: card.prompt, source_span: card.source_span });
    }
  }
  return { kept, dropped };
}
