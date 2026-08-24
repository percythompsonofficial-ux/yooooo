import { z } from "zod";

/**
 * The shape of a set of lecture notes.
 *
 * Every item carries `at` — the second in the recording where it was said — so
 * the UI can turn any line of notes into a button that replays the professor
 * saying it. That round trip is the whole point of the app, so `at` is required
 * everywhere rather than optional.
 *
 * Nothing here is `.optional()`. Structured outputs are far more reliable when
 * every field is required, so "absent" is expressed as an empty array or an
 * empty string and the prompt says so explicitly.
 */

const timestamped = {
  at: z
    .number()
    .describe("Seconds from the start of the recording where this was said."),
};

export const LectureNotesSchema = z.object({
  title: z
    .string()
    .describe("A specific title for this lecture's topic, max 8 words."),
  course_guess: z
    .string()
    .describe(
      "Best guess at the subject/course from content alone, or '' if unclear.",
    ),
  summary: z
    .string()
    .describe("3-5 sentences on what this lecture actually covered."),

  outline: z
    .array(
      z.object({
        ...timestamped,
        heading: z.string(),
        points: z.array(z.string()),
      }),
    )
    .describe("The lecture in order, as the professor moved through it."),

  key_concepts: z.array(
    z.object({
      ...timestamped,
      term: z.string(),
      definition: z
        .string()
        .describe("Defined the way the professor defined it, not generically."),
      why_it_matters: z.string(),
    }),
  ),

  formulas: z
    .array(
      z.object({
        ...timestamped,
        statement: z
          .string()
          .describe("The formula, theorem, or rule. Use LaTeX-ish plain text."),
        notation_notes: z
          .string()
          .describe("What each symbol means, and any stated conditions."),
        source: z
          .enum(["spoken", "slide", "both"])
          .describe(
            "Where this came from: said aloud, read off a slide photo, or both.",
          ),
      }),
    )
    .describe(
      "Formulas stated aloud or legible in a slide photo. Never reconstruct " +
        "one from your own knowledge.",
    ),

  board_content: z
    .array(
      z.object({
        ...timestamped,
        transcription: z
          .string()
          .describe(
            "What is written on the board or slide, transcribed as faithfully " +
              "as the photo allows. Preserve structure — lines, lists, labels.",
          ),
        context: z
          .string()
          .describe("What the professor was saying about it at the time."),
      }),
    )
    .describe(
      "Content read out of the slide photos. Empty when no photos were taken.",
    ),

  examples: z.array(
    z.object({
      ...timestamped,
      description: z.string(),
      takeaway: z.string().describe("The point the example was making."),
    }),
  ),

  exam_signals: z
    .array(
      z.object({
        ...timestamped,
        quote: z.string().describe("What the professor actually said."),
        note: z.string().describe("What this implies you should study."),
        confidence: z.enum(["explicit", "strong", "possible"]),
      }),
    )
    .describe(
      "Moments flagged as exam material: 'this will be on the test', heavy " +
        "repetition, 'the one thing to remember', time spent far out of " +
        "proportion to the topic's size.",
    ),

  assignments: z
    .array(
      z.object({
        ...timestamped,
        what: z.string(),
        due: z.string().describe("Due date as stated, or '' if not stated."),
      }),
    )
    .describe("Homework, readings, deadlines, or logistics mentioned aloud."),

  open_questions: z
    .array(
      z.object({
        ...timestamped,
        question: z.string(),
      }),
    )
    .describe(
      "Terms or ideas referenced as already-known but never explained here — " +
        "the things to look up before the next class.",
    ),

  suspected_mistranscriptions: z
    .array(
      z.object({
        ...timestamped,
        heard: z.string().describe("The garbled text as transcribed."),
        likely: z.string().describe("What the professor probably said."),
      }),
    )
    .describe(
      "Speech-to-text mangles technical vocabulary and proper nouns. Flag the " +
        "ones you had to guess at so they can be verified.",
    ),

  student_questions: z
    .array(
      z.object({
        ...timestamped,
        question: z.string(),
        answer: z.string().describe("The professor's answer, or '' if none."),
      }),
    )
    .describe("Questions asked from the room, and how they were answered."),
});

export type LectureNotes = z.infer<typeof LectureNotesSchema>;
