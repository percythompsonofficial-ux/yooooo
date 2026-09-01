import { Pool, type PoolClient } from "pg";
import {
  UNFILED_COURSE_ID,
  type Card,
  type LectureStatus,
  type LectureSummary,
  type Section,
  type StateRow,
} from "./types";

// Next reloads modules on every edit in dev; without this the pool leaks
// connections until Postgres refuses new ones.
const globalForPg = globalThis as unknown as { studyPool?: Pool };

export function pool(): Pool {
  if (!globalForPg.studyPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
      );
    }
    globalForPg.studyPool = new Pool({ connectionString, max: 5 });
  }
  return globalForPg.studyPool;
}

async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const out = await fn(client);
    await client.query("commit");
    return out;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export { tx };

/* ------------------------------------------------------------------ */
/* lectures                                                            */
/* ------------------------------------------------------------------ */

export async function createLecture(
  title: string,
  transcript: string,
): Promise<string> {
  const { rows } = await pool().query<{ id: string }>(
    `insert into lectures (course_id, title, transcript, source_kind, status)
     values ($1, $2, $3, 'paste', 'pending')
     returning id`,
    [UNFILED_COURSE_ID, title, transcript],
  );
  return rows[0].id;
}

export async function setLectureStatus(
  id: string,
  status: LectureStatus,
  error?: string,
): Promise<void> {
  await pool().query(
    `update lectures set status = $2, error = $3 where id = $1`,
    [id, status, error ?? null],
  );
}

export async function getTranscript(id: string): Promise<string | null> {
  const { rows } = await pool().query<{ transcript: string }>(
    `select transcript from lectures where id = $1`,
    [id],
  );
  return rows[0]?.transcript ?? null;
}

export async function listLectures(): Promise<LectureSummary[]> {
  const { rows } = await pool().query<LectureSummary>(
    `select l.id, l.title, l.status, l.error, l.created_at,
            count(c.id)::int as card_count,
            count(c.id) filter (where s.due <= now())::int as due_count
       from lectures l
       left join cards c      on c.lecture_id = l.id
       left join card_state s on s.card_id = c.id
      group by l.id
      order by l.created_at desc`,
  );
  return rows;
}

export async function deleteLecture(id: string): Promise<void> {
  await pool().query(`delete from lectures where id = $1`, [id]);
}

/* ------------------------------------------------------------------ */
/* sections and cards                                                  */
/* ------------------------------------------------------------------ */

export async function replaceSections(
  lectureId: string,
  sections: { ord: number; heading: string; thesis: string }[],
): Promise<Section[]> {
  return tx(async (c) => {
    await c.query(`delete from sections where lecture_id = $1`, [lectureId]);
    const out: Section[] = [];
    for (const s of sections) {
      const { rows } = await c.query<Section>(
        `insert into sections (lecture_id, ord, heading, thesis)
         values ($1, $2, $3, $4)
         returning id, lecture_id, ord, heading, thesis`,
        [lectureId, s.ord, s.heading, s.thesis],
      );
      out.push(rows[0]);
    }
    return out;
  });
}

export async function listSections(lectureId: string): Promise<Section[]> {
  const { rows } = await pool().query<Section>(
    `select id, lecture_id, ord, heading, thesis
       from sections where lecture_id = $1 order by ord`,
    [lectureId],
  );
  return rows;
}

export type NewCard = Omit<Card, "id" | "lecture_id"> & { lecture_id?: string };

/**
 * Inserts cards and their initial scheduling rows in one transaction, so a
 * card can never exist without a due date for the review queue to find.
 */
export async function insertCards(
  lectureId: string,
  cards: NewCard[],
  initialState: () => {
    due: Date;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    learning_steps: number;
    reps: number;
    lapses: number;
    state: number;
  },
): Promise<number> {
  if (cards.length === 0) return 0;
  return tx(async (c) => {
    let n = 0;
    for (const card of cards) {
      const { rows } = await c.query<{ id: string }>(
        `insert into cards
           (lecture_id, section_id, kind, prompt, answer, distractors,
            source_span, difficulty)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          lectureId,
          card.section_id,
          card.kind,
          card.prompt,
          card.answer,
          card.distractors ? JSON.stringify(card.distractors) : null,
          card.source_span,
          card.difficulty,
        ],
      );
      const s = initialState();
      await c.query(
        `insert into card_state
           (card_id, due, stability, difficulty, elapsed_days,
            scheduled_days, learning_steps, reps, lapses, state, last_review)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, null)`,
        [
          rows[0].id,
          s.due,
          s.stability,
          s.difficulty,
          s.elapsed_days,
          s.scheduled_days,
          s.learning_steps,
          s.reps,
          s.lapses,
          s.state,
        ],
      );
      n += 1;
    }
    return n;
  });
}

export async function listCards(lectureId: string): Promise<Card[]> {
  const { rows } = await pool().query<Card>(
    `select id, lecture_id, section_id, kind, prompt, answer,
            distractors, source_span, difficulty
       from cards where lecture_id = $1 order by created_at`,
    [lectureId],
  );
  return rows;
}

/* ------------------------------------------------------------------ */
/* the review queue                                                    */
/* ------------------------------------------------------------------ */

/**
 * The due queue. Returns cards with their raw scheduling rows in a single
 * query — the caller turns those into interval labels in memory rather than
 * issuing a round-trip per card.
 */
export async function dueCards(
  limit = 50,
): Promise<(Card & { heading: string; lecture_title: string; state_row: StateRow })[]> {
  const { rows } = await pool().query(
    `select c.id, c.lecture_id, c.section_id, c.kind, c.prompt, c.answer,
            c.distractors, c.source_span, c.difficulty,
            sec.heading, l.title as lecture_title,
            st.due, st.stability, st.difficulty as s_difficulty,
            st.elapsed_days, st.scheduled_days, st.learning_steps,
            st.reps, st.lapses, st.state, st.last_review
       from card_state st
       join cards c      on c.id = st.card_id
       join sections sec on sec.id = c.section_id
       join lectures l   on l.id = c.lecture_id
      where st.due <= now()
      order by st.due
      limit $1`,
    [limit],
  );

  return rows.map((r) => ({
    id: r.id,
    lecture_id: r.lecture_id,
    section_id: r.section_id,
    kind: r.kind,
    prompt: r.prompt,
    answer: r.answer,
    distractors: r.distractors,
    source_span: r.source_span,
    difficulty: r.difficulty,
    heading: r.heading,
    lecture_title: r.lecture_title,
    state_row: {
      due: r.due,
      stability: r.stability,
      difficulty: r.s_difficulty,
      elapsed_days: r.elapsed_days,
      scheduled_days: r.scheduled_days,
      learning_steps: r.learning_steps,
      reps: r.reps,
      lapses: r.lapses,
      state: r.state,
      last_review: r.last_review,
    },
  }));
}

export async function queueCounts(): Promise<{ due: number; total: number }> {
  const { rows } = await pool().query<{ due: string; total: string }>(
    `select count(*) filter (where due <= now()) as due,
            count(*)                             as total
       from card_state`,
  );
  return { due: Number(rows[0].due), total: Number(rows[0].total) };
}
