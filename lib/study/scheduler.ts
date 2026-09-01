import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  State,
  type Card as FsrsCard,
  type Grade,
} from "ts-fsrs";
import { tx } from "./db";
import type { RatingValue, StateRow } from "./types";

/**
 * request_retention is the dial: "schedule so I recall this share of what's
 * due". Raise it before an exam for shorter intervals, lower it in a quiet
 * week. Phase two exposes it per course; phase one hardcodes the default.
 */
const params = generatorParameters({ request_retention: 0.9 });
const f = fsrs(params);

/** A brand-new card: due immediately, so it shows up in the first session. */
export function initialState() {
  const c = createEmptyCard(new Date());
  return {
    due: c.due,
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as number,
  };
}

function toFsrs(row: StateRow): FsrsCard {
  return {
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_review ?? undefined,
  };
}

export type ReviewOutcome = {
  due: Date;
  /** Days until this card comes back. What the UI shows on the button. */
  interval: number;
  state: State;
};

/**
 * Records a rating and reschedules. The insert and the upsert share a
 * transaction: `reviews` is the append-only truth, `card_state` the derived
 * cache, and they must never disagree.
 */
export async function applyReview(
  cardId: string,
  rating: RatingValue,
  elapsedMs?: number,
): Promise<ReviewOutcome> {
  const now = new Date();

  return tx(async (c) => {
    const { rows } = await c.query<StateRow>(
      `select due, stability, difficulty, elapsed_days, scheduled_days,
              learning_steps, reps, lapses, state, last_review
         from card_state where card_id = $1 for update`,
      [cardId],
    );
    if (rows.length === 0) throw new Error(`No scheduling row for card ${cardId}`);

    const next = f.next(toFsrs(rows[0]), now, rating as Grade).card;

    await c.query(
      `insert into reviews (card_id, rated_at, rating, elapsed_ms)
       values ($1, $2, $3, $4)`,
      [cardId, now, rating, elapsedMs ?? null],
    );

    await c.query(
      `update card_state set
         due = $2, stability = $3, difficulty = $4, elapsed_days = $5,
         scheduled_days = $6, learning_steps = $7, reps = $8, lapses = $9,
         state = $10, last_review = $11
       where card_id = $1`,
      [
        cardId,
        next.due,
        next.stability,
        next.difficulty,
        next.elapsed_days,
        next.scheduled_days,
        next.learning_steps,
        next.reps,
        next.lapses,
        next.state,
        now,
      ],
    );

    return {
      due: next.due,
      interval: Math.max(
        0,
        Math.round((next.due.getTime() - now.getTime()) / 86_400_000),
      ),
      state: next.state,
    };
  });
}

/**
 * What each button will do, without committing to it — so the four ratings
 * can be labelled with their real intervals instead of guesses. Pure: the
 * caller already has the state row from the queue query.
 */
export function previewIntervals(
  row: StateRow,
  now = new Date(),
): Record<RatingValue, string> {
  const preview = f.repeat(toFsrs(row), now);
  const label = (d: Date) => {
    const mins = Math.round((d.getTime() - now.getTime()) / 60_000);
    if (mins < 60) return `${Math.max(1, mins)}m`;
    if (mins < 1440) return `${Math.round(mins / 60)}h`;
    const days = Math.round(mins / 1440);
    return days < 30 ? `${days}d` : `${Math.round(days / 30)}mo`;
  };

  return {
    1: label(preview[1].card.due),
    2: label(preview[2].card.due),
    3: label(preview[3].card.due),
    4: label(preview[4].card.due),
  };
}
