/**
 * Inserts one fixture lecture with grounded cards — no model calls, so the
 * review loop can be exercised without an API key.
 *   npx tsx --env-file-if-exists=.env.local scripts/seed.ts
 */
import { createLecture, insertCards, replaceSections, setLectureStatus, pool } from "../lib/study/db";
import { initialState } from "../lib/study/scheduler";
import { verifyGrounding } from "../lib/study/generate";

const TRANSCRIPT = `Today we cover E1 elimination. The rate-determining step is formation of the carbocation, which means the reaction is first order and depends only on the concentration of the substrate. Because a carbocation forms, rearrangements are possible whenever a more stable cation is within reach by a hydride or alkyl shift. Zaitsev's rule predicts the more substituted alkene is the major product. E1 competes directly with SN1, since both proceed through the same intermediate, and higher temperature favours elimination over substitution.`;

async function main() {
  const id = await createLecture("Week 4 — E1 elimination", TRANSCRIPT);
  const sections = await replaceSections(id, [
    { ord: 1, heading: "Rate and mechanism", thesis: "E1 is first order in substrate because the carbocation forms first." },
    { ord: 2, heading: "Products and competition", thesis: "Zaitsev governs the major product; SN1 competes for the same intermediate." },
  ]);

  const candidates = [
    { kind: "recall" as const, prompt: "What is the rate-determining step of an E1 reaction?", answer: "Formation of the carbocation.", distractors: [], source_span: "the rate-determining step is formation of the carbocation", difficulty: 2 },
    { kind: "mcq" as const, prompt: "The rate of an E1 reaction depends on the concentration of:", answer: "the substrate only", distractors: ["the base only", "both substrate and base", "the leaving group only"], source_span: "depends only on the concentration of the substrate", difficulty: 2 },
    { kind: "recall" as const, prompt: "Why are rearrangements possible in an E1 reaction?", answer: "A carbocation intermediate forms, so a hydride or alkyl shift can reach a more stable cation.", distractors: [], source_span: "rearrangements are possible whenever a more stable cation is within reach", difficulty: 3 },
    { kind: "recall" as const, prompt: "Which alkene does Zaitsev's rule predict as the major product?", answer: "The more substituted alkene.", distractors: [], source_span: "the more substituted alkene is the major product", difficulty: 1 },
    { kind: "recall" as const, prompt: "What favours elimination over substitution in an E1/SN1 competition?", answer: "Higher temperature.", distractors: [], source_span: "higher temperature favours elimination over substitution", difficulty: 2 },
    // Deliberately ungrounded — must be dropped by verifyGrounding.
    { kind: "recall" as const, prompt: "What is the activation energy of E1 in kJ/mol?", answer: "About 95 kJ/mol.", distractors: [], source_span: "the activation energy is approximately 95 kilojoules per mole", difficulty: 2 },
  ];

  const { kept, dropped } = verifyGrounding(TRANSCRIPT, candidates);
  console.log(`grounding: kept ${kept.length}, dropped ${dropped.length}`);
  for (const d of dropped) console.log(`  dropped: "${d.source_span}"`);

  const n = await insertCards(
    id,
    kept.map((c, i) => ({
      section_id: sections[i < 3 ? 0 : 1].id,
      kind: c.kind,
      prompt: c.prompt,
      answer: c.answer,
      distractors: c.kind === "mcq" && c.distractors.length ? c.distractors : null,
      source_span: c.source_span,
      difficulty: c.difficulty,
    })),
    initialState,
  );
  await setLectureStatus(id, "ready");
  console.log(`seeded lecture ${id} with ${n} cards`);
  await pool().end();
}

main().catch((e) => { console.error(e); process.exit(1); });
