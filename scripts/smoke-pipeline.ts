/**
 * The whole phase-two pipeline, with only the three model calls stubbed:
 * queue -> structure -> fan-out -> cards + notes -> status -> review queue
 * -> Anki export. Everything else runs for real against Postgres.
 *   npm run study:smoke:pipeline
 */
import { unzipSync } from "fflate";
import initSqlJs from "sql.js/dist/sql-asm.js";
import {
  cardsForExport, createCourse, createLecture, deleteCourse, deleteLecture,
  dueCards, getLecture, getNotes, listCards, listSections, pool,
} from "../lib/study/db";
import { enqueue, lectureProgress } from "../lib/study/jobs";
import { drain, type Generators } from "../lib/study/runner";
import { buildApkg, type ExportCard } from "../lib/study/anki";

let failures = 0;
const ok = (l: string, c: boolean, d = "") => {
  console.log(`${c ? "  ok  " : "  FAIL"}  ${l}${d ? ` — ${d}` : ""}`);
  if (!c) failures++;
};

const TRANSCRIPT = [
  "Today we cover E1 elimination.",
  "The rate-determining step is formation of the carbocation, which means the reaction is first order and depends only on the concentration of the substrate.",
  "Because a carbocation forms, rearrangements are possible whenever a more stable cation is within reach.",
  "Zaitsev's rule predicts the more substituted alkene is the major product.",
  "E1 competes directly with SN1, and higher temperature favours elimination over substitution.",
].join(" ");

const SECTIONS = [
  { heading: "Rate and mechanism", thesis: "E1 is first order in substrate." },
  { heading: "Rearrangements", thesis: "A carbocation permits shifts." },
  { heading: "Products", thesis: "Zaitsev governs the major product." },
];

/** Counts calls so we can prove the fan-out actually fanned out. */
const calls = { structure: 0, cards: 0, notes: 0 };

function stub(overrides: Partial<Generators> = {}): Generators {
  return {
    async structure() {
      calls.structure++;
      return { title: "E1 elimination", sections: SECTIONS };
    },
    async cards(_t, section) {
      calls.cards++;
      const grounded =
        section.heading === "Rate and mechanism"
          ? "the rate-determining step is formation of the carbocation"
          : section.heading === "Rearrangements"
            ? "rearrangements are possible whenever a more stable cation is within reach"
            : "the more substituted alkene is the major product";
      return [
        {
          kind: "recall" as const,
          prompt: `Grounded question for ${section.heading}?`,
          answer: "The grounded answer.",
          distractors: [],
          source_span: grounded,
          difficulty: 2,
        },
        {
          kind: "mcq" as const,
          prompt: `MCQ for ${section.heading}?`,
          answer: "right",
          distractors: ["wrong a", "wrong b", "wrong c"],
          source_span: grounded,
          difficulty: 1,
        },
        {
          // ungrounded — must never reach the database
          kind: "recall" as const,
          prompt: `Fabricated question for ${section.heading}?`,
          answer: "Invented.",
          distractors: [],
          source_span: "the lecturer said something never actually said",
          difficulty: 3,
        },
      ];
    },
    async notes(_t, sections) {
      calls.notes++;
      return sections.map((s) => `## ${s.heading}\n\n${s.thesis}`).join("\n\n");
    },
    ...overrides,
  };
}

async function main() {
  const courseId = await createCourse("Organic Chemistry II", "Fall 2026");
  const lectureId = await createLecture("", TRANSCRIPT, courseId);
  await enqueue(lectureId, "structure");

  // --- one pass: the structure job only
  const first = await drain({
    generators: stub(), concurrency: 1, budgetMs: 20_000, maxJobs: 1,
  });
  ok("structure job ran", calls.structure === 1, `claimed ${first.claimed}`);
  ok("maxJobs caps an invocation", first.claimed === 1, String(first.claimed));
  ok("report flags that work remains", first.moreWork);

  const sections = await listSections(lectureId);
  ok("sections were written", sections.length === 3, String(sections.length));
  ok("model title used because none was given",
     (await getLecture(lectureId))?.title === "E1 elimination");

  const midProgress = await lectureProgress(lectureId);
  ok("structure fanned out one card job per section, plus notes",
     midProgress.queued === 4, JSON.stringify(midProgress));
  ok("lecture reports as generating while work remains",
     (await getLecture(lectureId))?.status === "generating");

  // --- drain the rest
  await drain({ generators: stub(), concurrency: 3, budgetMs: 30_000 });
  ok("one card call per section", calls.cards === 3, String(calls.cards));
  ok("one notes call for the lecture", calls.notes === 1, String(calls.notes));

  const cards = await listCards(lectureId);
  ok("ungrounded cards were dropped before storage",
     cards.length === 6, `${cards.length} stored of 9 generated`);
  ok("no fabricated card survived",
     !cards.some((c) => c.prompt.startsWith("Fabricated")));
  ok("mcq distractors persisted",
     cards.filter((c) => c.kind === "mcq").every((c) => c.distractors?.length === 3));

  const notes = await getNotes(lectureId);
  ok("notes were written", !!notes && notes.body_md.includes("## Products"));

  const done = await lectureProgress(lectureId);
  ok("every job finished", done.done === 5 && done.queued === 0 && done.failed === 0,
     JSON.stringify(done));
  ok("lecture flips to ready", (await getLecture(lectureId))?.status === "ready");

  // --- new cards land in the review queue
  const queue = await dueCards(100);
  ok("generated cards are due immediately",
     queue.filter((c) => c.lecture_id === lectureId).length === 6,
     String(queue.filter((c) => c.lecture_id === lectureId).length));

  // --- re-running a section replaces its cards rather than duplicating them
  const sectionOne = sections[0];
  await enqueue(lectureId, "cards", { section_id: sectionOne.id });
  await drain({ generators: stub(), concurrency: 1, budgetMs: 20_000 });
  const afterRerun = await listCards(lectureId);
  ok("regenerating a section replaces its cards, not duplicates them",
     afterRerun.length === 6, `${afterRerun.length} cards`);

  // --- a failing job retries, then surfaces on the lecture
  await enqueue(lectureId, "notes");
  const boom = stub({ notes: async () => { throw new Error("model unavailable"); } });
  await drain({ generators: boom, concurrency: 1, budgetMs: 10_000 });
  const afterFail = await lectureProgress(lectureId);
  ok("a failed job is requeued for retry rather than lost",
     afterFail.queued === 1 && afterFail.failed === 0, JSON.stringify(afterFail));

  await pool().query(
    `update jobs set attempts = max_attempts, run_after = now()
      where lecture_id = $1 and status = 'queued'`, [lectureId]);
  await drain({ generators: boom, concurrency: 1, budgetMs: 10_000 });
  const exhausted = await getLecture(lectureId);
  ok("exhausted retries mark the lecture failed with the reason",
     exhausted?.status === "failed" && /model unavailable/.test(exhausted.error ?? ""),
     `${exhausted?.status}: ${exhausted?.error}`);

  // --- export the course
  const exportRows = await cardsForExport(courseId);
  ok("export query returns the course's cards with scheduling",
     exportRows.length === 6 && exportRows.every((r) => typeof r.state === "number"),
     String(exportRows.length));

  const apkg = await buildApkg(exportRows as ExportCard[], "Study::Organic Chemistry II");
  const SQL = await initSqlJs({});
  const db = new SQL.Database(unzipSync(apkg)["collection.anki2"]) as unknown as {
    exec: (s: string) => { values: unknown[][] }[]; close: () => void };
  const noteCount = Number(db.exec("select count(*) from notes")[0].values[0][0]);
  db.close();
  ok("the exported deck holds every card", noteCount === 6, String(noteCount));

  // --- cleanup
  await deleteLecture(lectureId);
  await deleteCourse(courseId);
  const { rows } = await pool().query<{ n: string }>(
    `select count(*) as n from jobs where lecture_id = $1`, [lectureId]);
  ok("deleting the lecture cleared its jobs", rows[0].n === "0");

  await pool().end();
  console.log(failures === 0 ? "\nAll pipeline checks passed.\n" : `\n${failures} FAILED\n`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
