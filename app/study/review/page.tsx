import Link from "next/link";
import { ReviewSession } from "@/components/study/ReviewSession";
import { dueCards } from "@/lib/study/db";
import { previewIntervals } from "@/lib/study/scheduler";
import type { DueCard } from "@/lib/study/types";

export default async function ReviewPage() {
  const rows = await dueCards(50);

  // One query gave us the scheduling rows; the four interval labels are
  // computed here rather than with a round-trip per card.
  const now = new Date();
  const queue: DueCard[] = rows.map((r) => ({
    ...r,
    intervals: previewIntervals(r.state_row, now),
  }));

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Nothing due</h1>
        <p className="max-w-prose text-sm text-stone-600">
          Every card you have is scheduled for later. That is the system working
          — come back when something comes up for review.
        </p>
        <Link
          href="/study"
          className="rounded bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Add a lecture
        </Link>
      </div>
    );
  }

  return <ReviewSession queue={queue} />;
}
