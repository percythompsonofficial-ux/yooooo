import { pool } from "./db";

export type JobKind = "structure" | "cards" | "notes";
export type JobStatus = "queued" | "running" | "done" | "failed";

export type Job = {
  id: string;
  lecture_id: string;
  kind: JobKind;
  payload: Record<string, string>;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  error: string | null;
};

/** A worker that dies mid-job leaves the row 'running'. Reclaim after this. */
const STALE_AFTER_MINUTES = 10;

/** Retry backoff by attempt number: 30s, 2m, 8m. */
function backoffSeconds(attempts: number): number {
  return Math.min(30 * 4 ** (attempts - 1), 480);
}

export async function enqueue(
  lectureId: string,
  kind: JobKind,
  payload: Record<string, string> = {},
): Promise<string> {
  const { rows } = await pool().query<{ id: string }>(
    `insert into jobs (lecture_id, kind, payload) values ($1, $2, $3) returning id`,
    [lectureId, kind, JSON.stringify(payload)],
  );
  return rows[0].id;
}

export async function enqueueMany(
  lectureId: string,
  kind: JobKind,
  payloads: Record<string, string>[],
): Promise<number> {
  if (payloads.length === 0) return 0;
  const { rowCount } = await pool().query(
    `insert into jobs (lecture_id, kind, payload)
     select $1, $2, x from jsonb_array_elements($3::jsonb) as x`,
    [lectureId, kind, JSON.stringify(payloads)],
  );
  return rowCount ?? 0;
}

/**
 * Takes one job off the queue.
 *
 * FOR UPDATE SKIP LOCKED is what makes this safe to run from more than one
 * worker at once: a row being claimed by one transaction is skipped by the
 * others rather than blocking them, so two overlapping cron invocations
 * never process the same job.
 */
export async function claim(): Promise<Job | null> {
  const { rows } = await pool().query<Job>(
    `update jobs
        set status = 'running', attempts = attempts + 1, locked_at = now()
      where id = (
        select id from jobs
         where status = 'queued' and run_after <= now()
         order by id
         for update skip locked
         limit 1
      )
    returning id, lecture_id, kind, payload, status, attempts, max_attempts, error`,
  );
  return rows[0] ?? null;
}

export async function complete(jobId: string): Promise<void> {
  await pool().query(
    `update jobs set status = 'done', finished_at = now(), error = null
      where id = $1`,
    [jobId],
  );
}

/**
 * Records a failure. Requeues with backoff while attempts remain, otherwise
 * marks the job failed for good.
 */
export async function fail(job: Job, message: string): Promise<"retry" | "failed"> {
  const exhausted = job.attempts >= job.max_attempts;
  if (exhausted) {
    await pool().query(
      `update jobs set status = 'failed', error = $2, finished_at = now()
        where id = $1`,
      [job.id, message],
    );
    return "failed";
  }
  await pool().query(
    `update jobs
        set status = 'queued', error = $2,
            run_after = now() + make_interval(secs => $3::int),
            locked_at = null
      where id = $1`,
    [job.id, message, backoffSeconds(job.attempts)],
  );
  return "retry";
}

/** Returns jobs stranded by a worker that died mid-run to the queue. */
export async function reclaimStale(): Promise<number> {
  const { rowCount } = await pool().query(
    `update jobs
        set status = 'queued', locked_at = null,
            error = coalesce(error, 'Worker stopped before finishing; requeued.')
      where status = 'running'
        and locked_at < now() - make_interval(mins => $1::int)`,
    [STALE_AFTER_MINUTES],
  );
  return rowCount ?? 0;
}

export type LectureProgress = {
  queued: number;
  running: number;
  done: number;
  failed: number;
  total: number;
};

export async function lectureProgress(lectureId: string): Promise<LectureProgress> {
  const { rows } = await pool().query<Record<JobStatus | "total", string>>(
    `select
       count(*) filter (where status = 'queued')  as queued,
       count(*) filter (where status = 'running') as running,
       count(*) filter (where status = 'done')    as done,
       count(*) filter (where status = 'failed')  as failed,
       count(*)                                   as total
     from jobs where lecture_id = $1`,
    [lectureId],
  );
  const r = rows[0];
  return {
    queued: Number(r.queued),
    running: Number(r.running),
    done: Number(r.done),
    failed: Number(r.failed),
    total: Number(r.total),
  };
}

/** Progress for many lectures at once, for the listing page. */
export async function progressByLecture(): Promise<Map<string, LectureProgress>> {
  const { rows } = await pool().query<{
    lecture_id: string;
    queued: string; running: string; done: string; failed: string; total: string;
  }>(
    `select lecture_id,
       count(*) filter (where status = 'queued')  as queued,
       count(*) filter (where status = 'running') as running,
       count(*) filter (where status = 'done')    as done,
       count(*) filter (where status = 'failed')  as failed,
       count(*)                                   as total
     from jobs group by lecture_id`,
  );
  return new Map(
    rows.map((r) => [
      r.lecture_id,
      {
        queued: Number(r.queued),
        running: Number(r.running),
        done: Number(r.done),
        failed: Number(r.failed),
        total: Number(r.total),
      },
    ]),
  );
}

export async function retryFailed(lectureId: string): Promise<number> {
  const { rowCount } = await pool().query(
    `update jobs
        set status = 'queued', attempts = 0, error = null,
            run_after = now(), locked_at = null, finished_at = null
      where lecture_id = $1 and status = 'failed'`,
    [lectureId],
  );
  return rowCount ?? 0;
}

export async function pendingCount(): Promise<number> {
  const { rows } = await pool().query<{ n: string }>(
    `select count(*) as n from jobs where status in ('queued','running')`,
  );
  return Number(rows[0].n);
}
