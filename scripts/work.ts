/**
 * Local stand-in for the cron that drives /api/jobs/run in production.
 * Drains the queue, then polls.
 *   npm run jobs:work
 */
import { drain } from "../lib/study/runner";
import { pendingCount } from "../lib/study/jobs";
import { pool } from "../lib/study/db";

const once = process.argv.includes("--once");

async function main() {
  console.log(once ? "Draining once…" : "Worker running. Ctrl-C to stop.");
  for (;;) {
    const pending = await pendingCount();
    if (pending > 0) {
      const report = await drain({ budgetMs: 55_000 });
      console.log(
        `[${new Date().toLocaleTimeString()}] claimed ${report.claimed} · ` +
          `done ${report.done} · retried ${report.retried} · failed ${report.failed}` +
          (report.reclaimed ? ` · reclaimed ${report.reclaimed}` : "") +
          ` · ${report.ms}ms`,
      );
    }
    if (once) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  await pool().end();
}

main().catch((e) => { console.error(e); process.exit(1); });
