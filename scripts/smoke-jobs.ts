/**
 * Job queue checks — concurrency, retry/backoff, stale reclaim.
 *   npm run study:smoke:jobs
 */
import { createLecture, deleteLecture, pool } from "../lib/study/db";
import {
  claim, complete, enqueue, enqueueMany, fail, lectureProgress,
  pendingCount, reclaimStale, retryFailed, type Job,
} from "../lib/study/jobs";

let failures = 0;
const ok = (l: string, c: boolean, d = "") => {
  console.log(`${c ? "  ok  " : "  FAIL"}  ${l}${d ? ` — ${d}` : ""}`);
  if (!c) failures++;
};

async function main() {
  const lectureId = await createLecture("Smoke — jobs", "x".repeat(400));

  // --- fan-out enqueue
  await enqueue(lectureId, "structure");
  const n = await enqueueMany(
    lectureId,
    "cards",
    Array.from({ length: 7 }, (_, i) => ({ section_id: `s${i}` })),
  );
  ok("enqueueMany inserts one row per section", n === 7, String(n));

  const p0 = await lectureProgress(lectureId);
  ok("progress counts all queued work", p0.queued === 8 && p0.total === 8,
     JSON.stringify(p0));

  // --- THE load-bearing check: 12 workers race for 8 jobs.
  // Every job must go to exactly one claimer, and nobody may block.
  const claims = await Promise.all(Array.from({ length: 12 }, () => claim()));
  const got = claims.filter(Boolean) as Job[];
  const ids = got.map((j) => j.id);
  const unique = new Set(ids);
  ok("concurrent claims hand out every job", got.length === 8, `${got.length}/8`);
  ok("no job is claimed twice", unique.size === ids.length,
     `${unique.size} unique of ${ids.length}`);
  ok("surplus workers get null rather than blocking",
     claims.filter((c) => c === null).length === 4);

  const p1 = await lectureProgress(lectureId);
  ok("claimed jobs show as running", p1.running === 8, JSON.stringify(p1));

  // --- retry with backoff
  const victim = got[0];
  const first = await fail(victim, "transient boom");
  ok("first failure retries", first === "retry");
  const { rows: after } = await pool().query<{ status: string; run_after: Date; attempts: number }>(
    `select status, run_after, attempts from jobs where id = $1`, [victim.id]);
  ok("retry goes back to queued", after[0].status === "queued", after[0].status);
  ok("retry is delayed by backoff, not immediate",
     after[0].run_after.getTime() > Date.now() + 1000,
     `+${Math.round((after[0].run_after.getTime() - Date.now()) / 1000)}s`);

  const claimedNow = await claim();
  ok("a backed-off job is not claimable yet",
     claimedNow === null || claimedNow.id !== victim.id);
  if (claimedNow) await complete(claimedNow.id);

  // --- exhaust the attempts
  await pool().query(`update jobs set attempts = max_attempts where id = $1`, [victim.id]);
  const last = await fail({ ...victim, attempts: victim.max_attempts }, "permanent boom");
  ok("failure past max_attempts is terminal", last === "failed");
  const p2 = await lectureProgress(lectureId);
  ok("failed job counted as failed", p2.failed === 1, JSON.stringify(p2));

  // --- stale reclaim
  await pool().query(
    `update jobs set status='running', locked_at = now() - interval '30 minutes'
      where lecture_id = $1 and status = 'running'`, [lectureId]);
  const reclaimed = await reclaimStale();
  ok("stale running jobs are returned to the queue", reclaimed >= 1, String(reclaimed));

  // --- retryFailed resets the terminal one
  const reset = await retryFailed(lectureId);
  ok("retryFailed requeues terminal failures", reset === 1, String(reset));
  const p3 = await lectureProgress(lectureId);
  ok("nothing left failed after retry", p3.failed === 0, JSON.stringify(p3));

  const pending = await pendingCount();
  ok("pendingCount sees outstanding work", pending > 0, String(pending));

  await deleteLecture(lectureId);
  const { rows: leftover } = await pool().query<{ n: string }>(
    `select count(*) as n from jobs where lecture_id = $1`, [lectureId]);
  ok("deleting a lecture cascades to its jobs", leftover[0].n === "0", leftover[0].n);

  await pool().end();
  console.log(failures === 0 ? "\nAll job checks passed.\n" : `\n${failures} FAILED\n`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
