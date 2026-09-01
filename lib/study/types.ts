export type CardKind = "recall" | "mcq" | "cloze";

export type LectureStatus =
  | "pending"
  | "structuring"
  | "generating"
  | "ready"
  | "failed";

/** ts-fsrs Rating, minus Manual. The four buttons on the review page. */
export const RATINGS = { again: 1, hard: 2, good: 3, easy: 4 } as const;
export type RatingValue = (typeof RATINGS)[keyof typeof RATINGS];

export const UNFILED_COURSE_ID = "00000000-0000-0000-0000-000000000001";

export type Section = {
  id: string;
  lecture_id: string;
  ord: number;
  heading: string;
  thesis: string;
};

export type Card = {
  id: string;
  lecture_id: string;
  section_id: string;
  kind: CardKind;
  prompt: string;
  answer: string;
  distractors: string[] | null;
  source_span: string;
  difficulty: number;
};

export type LectureSummary = {
  id: string;
  title: string;
  status: LectureStatus;
  error: string | null;
  created_at: Date;
  card_count: number;
  due_count: number;
  course_id?: string;
  course_name?: string;
};

/** The scheduling row as stored — mirrors the ts-fsrs Card interface. */
export type StateRow = {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: Date | null;
};

/** A card joined with its scheduling row, ready to review. */
export type DueCard = Card & {
  heading: string;
  lecture_title: string;
  state_row: StateRow;
  /** What each of the four buttons will schedule, e.g. { 1: "1m", 3: "10m" }. */
  intervals: Record<RatingValue, string>;
};
