import {
  clearSectionCards,
  courseNameFor,
  getSection,
  getTranscript,
  insertCards,
  listSections,
  replaceSections,
  setLectureStatus,
  upsertNotes,
  pool,
} from "./db";
import {
  MODEL,
  generateCards,
  generateNotes,
  structureLecture,
  verifyGrounding,
} from "./generate";
import type { GeneratedCard, Structure } from "./generate";
import {
  claim,
  complete,
  enqueue,
  enqueueMany,
  fail,
  reclaimStale,
  type Job,
} from "./jobs";
import { initialState } from "./scheduler";

/* ------------------------------------------------------------------ */
/* job handlers                                                        */
/* ------------------------------------------------------------------ */

/**
 * The three model calls, behind one seam. Everything else in this file —
 * fan-out, grounding, card replacement, status derivation — runs for real
 * against the database; tests substitute these so the pipeline can be
 * exercised without spending money or needing a key.
 */
export type Generators = {
  structure: (transcript: string) => Promise<Structure>;
  cards: (
    transcript: string,
    section: { heading: string; thesis: string },
    courseName?: string,
  ) => Promise<GeneratedCard[]>;
  notes: (
    transcript: string,
    sections: { heading: string; thesis: string }[],
    courseName?: string,
  ) => Promise<string>;
};

const LIVE: Generators = {
  structure: structureLecture,
  cards: generateCards,
  notes: generateNotes,
};

async function runStructure(job: Job, gen: Generators): Promise<void> {
  const transcript = await getTranscript(job.lecture_id);
  if (!transcript) throw new Error("Lecture has no transcript.");

  const structure = await gen.structure(transcript);
  if (structure.sections.length === 0) {
    throw new Error("The structure pass found no sections in this transcript.");
  }

  const sections = await replaceSections(
    job.lecture_id,
    structure.sections.map((s, i) => ({
      ord: i + 1,
      heading: s.heading,
      thesis: s.thesis,
    })),
  );

  // Give the lecture the model's title only if the user didn't name it.
  await pool().query(
    `update lectures set title = $2
      where id = $1 and (title = '' or title = 'Untitled lecture')`,
    [job.lecture_id, structure.title],
  );

  // The fan-out: one card job per section, plus notes for the whole lecture.
  await enqueueMany(
    job.lecture_id,
    "cards",
    sections.map((s) => ({ section_id: s.id })),
  );
  await enqueue(job.lecture_id, "notes");
}

async function runCards(job: Job, gen: Generators): Promise<void> {
  const sectionId = job.payload.section_id;
  if (!sectionId) throw new Error("Card job has no section_id.");

  const [transcript, section] = await Promise.all([
    getTranscript(job.lecture_id),
    getSection(sectionId),
  ]);
  if (!transcript) throw new Error("Lecture has no transcript.");
  if (!section) throw new Error("Section no longer exists.");

  const courseName = await courseNameFor(job.lecture_id);
  const generated = await gen.cards(transcript, section, courseName ?? undefined);
  const { kept } = verifyGrounding(transcript, generated);

  // A retry must replace this section's cards, not add a second set.
  await clearSectionCards(sectionId);
  await insertCards(
    job.lecture_id,
    kept.map((c) => ({
      section_id: sectionId,
      kind: c.kind,
      prompt: c.prompt,
      answer: c.answer,
      distractors: c.kind === "mcq" && c.distractors.length ? c.distractors : null,
      source_span: c.source_span,
      difficulty: c.difficulty,
    })),
    initialState,
  );
}

async function runNotes(job: Job, gen: Generators): Promise<void> {
  const [transcript, sections] = await Promise.all([
    getTranscript(job.lecture_id),
    listSections(job.lecture_id),
  ]);
  if (!transcript) throw new Error("Lecture has no transcript.");
  if (sections.length === 0) throw new Error("No sections to write notes against.");

  const courseName = await courseNameFor(job.lecture_id);
  const body = await gen.notes(transcript, sections, courseName ?? undefined);
  if (!body) throw new Error("The notes pass returned nothing.");
  await upsertNotes(job.lecture_id, body, MODEL);
}

const HANDLERS: Record<
  Job["kind"],
  (job: Job, gen: Generators) => Promise<void>
> = {
  structure: runStructure,
  cards: runCards,
  notes: runNotes,
};

/* ------------------------------------------------------------------ */
/* lecture status                                                      */
/* ------------------------------------------------------------------ */

/**
 * Derives the lecture's status from its jobs. Called after every job so the
 * listing reflects reality even if a worker is killed between jobs.
 */
export async function syncLectureStatus(lectureId: string): Promise<void> {
  const { rows } = await pool().query<{
    queued: string; running: string; failed: string; total: string; kinds: string[];
  }>(
    `select
       count(*) filter (where status = 'queued')  as queued,
       count(*) filter (where status = 'running') as running,
       count(*) filter (where status = 'failed')  as failed,
       count(*)                                    as total,
       coalesce(array_agg(distinct kind) filter (
         where status in ('queued','running')), '{}') as kinds
     from jobs where lecture_id = $1`,
    [lectureId],
  );
  const r = rows[0];
  const outstanding = Number(r.queued) + Number(r.running);

  if (outstanding > 0) {
    await setLectureStatus(
      lectureId,
      r.kinds.includes("structure") ? "structuring" : "generating",
    );
    return;
  }
  if (Number(r.failed) > 0) {
    const { rows: e } = await pool().query<{ error: string }>(
      `select error from jobs
        where lecture_id = $1 and status = 'failed' and error is not null
        order by finished_at desc limit 1`,
      [lectureId],
    );
    await setLectureStatus(lectureId, "failed", e[0]?.error ?? "Generation failed.");
    return;
  }
  if (Number(r.total) > 0) await setLectureStatus(lectureId, "ready");
}

/* ------------------------------------------------------------------ */
/* the drain loop                                                      */
/* ------------------------------------------------------------------ */

export type DrainReport = {
  claimed: number;
  done: number;
  retried: number;
  failed: number;
  reclaimed: number;
  moreWork: boolean;
  ms: number;
};

export type DrainOptions = {
  /** Stop claiming new work past this. Keep it under the platform's cap. */
  budgetMs?: number;
  /** How many jobs run at once. Each is one model call. */
  concurrency?: number;
  /** Substitute the model calls. Defaults to the live Claude API. */
  generators?: Generators;
  /** Ceiling on jobs per invocation — a cap on model spend per cron tick. */
  maxJobs?: number;
};

/**
 * Drains the queue until it is empty or the time budget runs out.
 *
 * The budget matters: a serverless invocation is killed at a hard limit, and
 * a job cut off mid-flight would sit in 'running' until reclaimStale picks it
 * up. Stopping early and reporting `moreWork` lets the next cron tick
 * continue instead.
 */
export async function drain(opts: DrainOptions = {}): Promise<DrainReport> {
  const budgetMs = opts.budgetMs ?? Number(process.env.JOB_BUDGET_MS ?? 50_000);
  const concurrency = opts.concurrency ?? Number(process.env.JOB_CONCURRENCY ?? 3);
  const generators = opts.generators ?? LIVE;
  const maxJobs = opts.maxJobs ?? Number(process.env.JOB_MAX_PER_RUN ?? 0) ?? 0;
  const startedAt = Date.now();

  const report: DrainReport = {
    claimed: 0, done: 0, retried: 0, failed: 0,
    reclaimed: await reclaimStale(), moreWork: false, ms: 0,
  };

  const touched = new Set<string>();
  let exhausted = false;

  async function worker() {
    while (!exhausted && Date.now() - startedAt < budgetMs) {
      if (maxJobs > 0 && report.claimed >= maxJobs) return;
      const job = await claim();
      if (!job) {
        exhausted = true;
        return;
      }
      report.claimed += 1;
      touched.add(job.lecture_id);
      try {
        await HANDLERS[job.kind](job, generators);
        await complete(job.id);
        report.done += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const outcome = await fail(job, message);
        if (outcome === "retry") report.retried += 1;
        else report.failed += 1;
      }
      await syncLectureStatus(job.lecture_id);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  for (const lectureId of touched) await syncLectureStatus(lectureId);

  const { rows } = await pool().query<{ n: string }>(
    `select count(*) as n from jobs
      where status = 'queued' and run_after <= now()`,
  );
  report.moreWork = Number(rows[0].n) > 0;
  report.ms = Date.now() - startedAt;
  return report;
}
