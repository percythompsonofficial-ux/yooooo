/**
 * End-to-end check of the storage + scheduling loop, no model calls.
 * Creates a throwaway lecture, drives cards through all four ratings, and
 * verifies the queue drains and due dates move the way FSRS says they should.
 *   npm run study:smoke
 */
import {
  createLecture,
  deleteLecture,
  dueCards,
  insertCards,
  listCards,
  queueCounts,
  replaceSections,
  setLectureStatus,
  pool,
} from "../lib/study/db";
import { applyReview, initialState, previewIntervals } from "../lib/study/scheduler";
import { RATINGS, type RatingValue } from "../lib/study/types";

let failures = 0;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "  ok  " : "  FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures += 1;
}

const TRANSCRIPT =
  "Today we cover E1 elimination. The rate-determining step is formation of " +
  "the carbocation, which means the reaction is first order and depends only " +
  "on the concentration of the substrate. Zaitsev's rule predicts the more " +
  "substituted alkene is the major product.";

async function main() {
  const before = await queueCounts();
  const lectureId = await createLecture("Smoke — E1 elimination", TRANSCRIPT);
  console.log(`\nlecture ${lectureId}`);

  const sections = await replaceSections(lectureId, [
    { ord: 1, heading: "Rate-determining step", thesis: "E1 is first order." },
  ]);
  check("section inserted", sections.length === 1);

  const inserted = await insertCards(
    lectureId,
    [
      {
        section_id: sections[0].id,
        kind: "recall",
        prompt: "What is the rate-determining step of an E1 reaction?",
        answer: "Formation of the carbocation.",
        distractors: null,
        source_span: "the rate-determining step is formation of the carbocation",
        difficulty: 2,
      },
      {
        section_id: sections[0].id,
        kind: "mcq",
        prompt: "E1 reaction rate depends on the concentration of:",
        answer: "the substrate only",
        distractors: ["the base only", "both substrate and base", "the solvent"],
        source_span: "depends only on the concentration of the substrate",
        difficulty: 1,
      },
      {
        section_id: sections[0].id,
        kind: "recall",
        prompt: "Which alkene does Zaitsev's rule predict as the major product?",
        answer: "The more substituted alkene.",
        distractors: null,
        source_span: "the more substituted alkene is the major product",
        difficulty: 2,
      },
      {
        section_id: sections[0].id,
        kind: "recall",
        prompt: "What reaction order is E1?",
        answer: "First order.",
        distractors: null,
        source_span: "the reaction is first order",
        difficulty: 1,
      },
    ],
    initialState,
  );
  check("4 cards + scheduling rows inserted", inserted === 4, `${inserted}`);

  await setLectureStatus(lectureId, "ready");

  const stored = await listCards(lectureId);
  const mcq = stored.find((c) => c.kind === "mcq");
  check(
    "mcq distractors round-trip as an array",
    Array.isArray(mcq?.distractors) && mcq!.distractors!.length === 3,
    JSON.stringify(mcq?.distractors),
  );

  const mid = await queueCounts();
  check(
    "new cards are due immediately",
    mid.due === before.due + 4,
    `due ${before.due} -> ${mid.due}`,
  );

  const queue = await dueCards();
  check("review queue joins heading + lecture title",
    queue.every((c) => c.heading.length > 0 && c.lecture_title.length > 0));
  check("review queue carries scheduling state in the same query",
    queue.every((c) => typeof c.state_row.stability === "number"));

  // Interval labels for the four buttons, before any rating.
  const labels = previewIntervals(queue[0].state_row);
  console.log(`  preview  again ${labels[1]} · hard ${labels[2]} · good ${labels[3]} · easy ${labels[4]}`);
  check("four interval labels produced", Object.keys(labels).length === 4);

  // Drive one card through each rating and confirm the due date moves out.
  const order: [string, RatingValue][] = [
    ["again", RATINGS.again],
    ["hard", RATINGS.hard],
    ["good", RATINGS.good],
    ["easy", RATINGS.easy],
  ];
  const intervals: Record<string, number> = {};
  for (let i = 0; i < order.length; i++) {
    const [name, rating] = order[i];
    const out = await applyReview(stored[i].id, rating, 4200);
    intervals[name] = out.due.getTime() - Date.now();
    console.log(
      `  rated ${name.padEnd(5)} -> due ${out.due.toISOString()} (${out.interval}d, state ${out.state})`,
    );
    check(`${name} pushes due into the future`, out.due.getTime() > Date.now() - 1000);
  }

  check(
    "easy schedules further out than again",
    intervals.easy > intervals.again,
    `${Math.round(intervals.easy / 60000)}m vs ${Math.round(intervals.again / 60000)}m`,
  );
  check(
    "good schedules further out than hard",
    intervals.good > intervals.hard,
    `${Math.round(intervals.good / 60000)}m vs ${Math.round(intervals.hard / 60000)}m`,
  );

  const after = await queueCounts();
  check(
    "rated cards leave the due queue",
    after.due === before.due,
    `due back to ${after.due}`,
  );

  const { rows } = await pool().query<{ n: string }>(
    `select count(*) as n from reviews where card_id = any($1::uuid[])`,
    [stored.map((c) => c.id)],
  );
  check("every rating wrote a review row", Number(rows[0].n) === 4, rows[0].n);

  await deleteLecture(lectureId);
  const cleaned = await queueCounts();
  check(
    "deleting a lecture cascades to cards and state",
    cleaned.total === before.total,
    `total ${cleaned.total}`,
  );

  await pool().end();
  console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} CHECK(S) FAILED\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
