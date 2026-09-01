import { drain } from "@/lib/study/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The worker. Cron hits this; it drains the job queue and returns a summary.
 *
 * Vercel Cron sends GET with `Authorization: Bearer $CRON_SECRET`, so both
 * verbs are accepted and either that header or `x-cron-secret` will do.
 */
function authorize(req: Request): string | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Unauthenticated draining is fine on a laptop and never in production —
    // this endpoint spends money on model calls.
    return process.env.NODE_ENV === "production"
      ? "CRON_SECRET is not set; refusing to run the worker in production."
      : null;
  }

  const bearer = req.headers.get("authorization");
  const header = req.headers.get("x-cron-secret");
  const ok = bearer === `Bearer ${secret}` || header === secret;
  return ok ? null : "Unauthorized.";
}

async function handle(req: Request): Promise<Response> {
  const problem = authorize(req);
  if (problem) {
    return Response.json({ error: problem }, { status: 401 });
  }

  try {
    const report = await drain();
    return Response.json(report, {
      // Tell the caller to come straight back if the budget ran out mid-queue.
      headers: report.moreWork ? { "x-more-work": "1" } : {},
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
