/**
 * Seeds a realistic course and lecture by running the real pipeline with the
 * model calls stubbed — no API key, no spend.
 *   npx tsx --env-file-if-exists=.env.local scripts/seed.ts
 */
import { createCourse, createLecture, pool } from "../lib/study/db";
import { enqueue } from "../lib/study/jobs";
import { drain, type Generators } from "../lib/study/runner";

const TRANSCRIPT = [
  "Today we cover E1 elimination.",
  "The rate-determining step is formation of the carbocation, which means the reaction is first order and depends only on the concentration of the substrate.",
  "Because a carbocation forms, rearrangements are possible whenever a more stable cation is within reach by a hydride or alkyl shift.",
  "Zaitsev's rule predicts the more substituted alkene is the major product.",
  "E1 competes directly with SN1, since both proceed through the same intermediate, and higher temperature favours elimination over substitution.",
].join(" ");

const SECTIONS = [
  { heading: "Rate and mechanism", thesis: "E1 is first order because the carbocation forms first.",
    span: "the rate-determining step is formation of the carbocation" },
  { heading: "Rearrangements", thesis: "A carbocation intermediate permits hydride and alkyl shifts.",
    span: "rearrangements are possible whenever a more stable cation is within reach" },
  { heading: "Products and competition", thesis: "Zaitsev governs the major product; SN1 competes.",
    span: "the more substituted alkene is the major product" },
];

const stub: Generators = {
  async structure() {
    return {
      title: "Week 4 — E1 elimination",
      sections: SECTIONS.map(({ heading, thesis }) => ({ heading, thesis })),
    };
  },
  async cards(_t, section) {
    const s = SECTIONS.find((x) => x.heading === section.heading)!;
    return [
      { kind: "recall" as const, prompt: `What does "${section.heading}" establish?`,
        answer: s.thesis, distractors: [], source_span: s.span, difficulty: 2 },
      { kind: "mcq" as const, prompt: "The rate of an E1 reaction depends on the concentration of:",
        answer: "the substrate only",
        distractors: ["the base only", "both substrate and base", "the leaving group only"],
        source_span: s.span, difficulty: 2 },
      { kind: "recall" as const, prompt: `Fabricated claim about ${section.heading}?`,
        answer: "Never said.", distractors: [],
        source_span: "a sentence the lecturer never uttered", difficulty: 3 },
    ];
  },
  async notes(_t, sections) {
    return [
      "## Rate and mechanism",
      "E1 proceeds through a **carbocation**. Formation of that cation is the rate-determining step, so the reaction is *first order* and its rate depends only on the substrate concentration.",
      "- Rate = k[substrate]",
      "- The base plays no part in the rate-determining step",
      "",
      "## Rearrangements",
      "Because a discrete carbocation forms, a hydride or alkyl shift can occur whenever it reaches a more stable cation.",
      "",
      "## Products and competition",
      "Zaitsev's rule predicts the more substituted alkene dominates. E1 and SN1 share an intermediate, so they compete; higher temperature favours elimination.",
      "> Worth remembering for the exam: temperature is the lever between E1 and SN1.",
    ].join("\n");
  },
};

async function main() {
  const courseId = await createCourse("Organic Chemistry II", "Fall 2026");
  const lectureId = await createLecture("", TRANSCRIPT, courseId);
  await enqueue(lectureId, "structure");

  for (let i = 0; i < 4; i++) {
    const r = await drain({ generators: stub, concurrency: 3, budgetMs: 20_000 });
    if (!r.moreWork && r.claimed === 0) break;
  }

  const { rows } = await pool().query<{ n: string }>(
    `select count(*) as n from cards where lecture_id = $1`, [lectureId]);
  console.log(`seeded course ${courseId}`);
  console.log(`seeded lecture ${lectureId} with ${rows[0].n} cards (ungrounded ones dropped)`);
  await pool().end();
}

main().catch((e) => { console.error(e); process.exit(1); });
