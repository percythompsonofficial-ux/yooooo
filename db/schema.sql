-- Lecture-to-recall study system.
-- Idempotent: safe to run repeatedly.

create table if not exists courses (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  term  text not null default ''
);

-- Phase one has no course UI; everything lands in this row.
insert into courses (id, name, term)
values ('00000000-0000-0000-0000-000000000001', 'Unfiled', '')
on conflict (id) do nothing;

create table if not exists lectures (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null,
  recorded_on date,
  source_kind text not null default 'paste',   -- paste | caption | audio | pdf
  transcript  text not null,
  status      text not null default 'pending', -- pending | structuring | generating | ready | failed
  error       text,
  created_at  timestamptz not null default now()
);

create table if not exists sections (
  id         uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references lectures(id) on delete cascade,
  ord        int  not null,
  heading    text not null,
  thesis     text not null,
  start_ms   int,
  end_ms     int,
  unique (lecture_id, ord)
);

create table if not exists notes (
  lecture_id   uuid primary key references lectures(id) on delete cascade,
  body_md      text not null,
  model        text not null,
  generated_at timestamptz not null default now()
);

-- Immutable generated content. Regenerating a lecture replaces rows here
-- without touching review history in `reviews`.
create table if not exists cards (
  id          uuid primary key default gen_random_uuid(),
  lecture_id  uuid not null references lectures(id) on delete cascade,
  section_id  uuid not null references sections(id) on delete cascade,
  kind        text not null,          -- recall | mcq | cloze
  prompt      text not null,
  answer      text not null,
  distractors jsonb,                  -- mcq only
  source_span text not null,          -- verbatim transcript quote, verified at write time
  difficulty  smallint not null default 2,
  created_at  timestamptz not null default now()
);

create index if not exists cards_lecture_idx on cards (lecture_id);

-- Mutable scheduling state. Column set mirrors the ts-fsrs `Card` interface
-- exactly so a row round-trips through the scheduler without reconstruction.
create table if not exists card_state (
  card_id        uuid primary key references cards(id) on delete cascade,
  due            timestamptz not null,
  stability      double precision not null,
  difficulty     double precision not null,
  elapsed_days   integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps           integer not null default 0,
  lapses         integer not null default 0,
  state          smallint not null default 0,  -- ts-fsrs State: 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review    timestamptz
);

create index if not exists card_state_due_idx on card_state (due);

-- Append-only. card_state is a derived cache that could be rebuilt from this.
create table if not exists reviews (
  id         bigserial primary key,
  card_id    uuid not null references cards(id) on delete cascade,
  rated_at   timestamptz not null default now(),
  rating     smallint not null,  -- 1 again, 2 hard, 3 good, 4 easy
  elapsed_ms integer
);

create index if not exists reviews_card_idx on reviews (card_id, rated_at desc);

/* ------------------------------------------------------------------ */
/* phase two: background jobs                                          */
/* ------------------------------------------------------------------ */

-- Generating a lecture takes minutes, which is far longer than a request may
-- run. Ingest writes a row here and returns; a cron-triggered worker drains
-- the queue. One row per unit of work, so a single bad section fails and
-- retries on its own instead of losing the whole lecture.
create table if not exists jobs (
  id           bigserial primary key,
  lecture_id   uuid not null references lectures(id) on delete cascade,
  kind         text not null,                    -- structure | cards | notes
  payload      jsonb not null default '{}'::jsonb, -- e.g. {"section_id": "..."}
  status       text not null default 'queued',   -- queued | running | done | failed
  attempts     int  not null default 0,
  max_attempts int  not null default 3,
  error        text,
  run_after    timestamptz not null default now(),
  locked_at    timestamptz,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);

create index if not exists jobs_claim_idx on jobs (status, run_after, id);
create index if not exists jobs_lecture_idx on jobs (lecture_id);

-- Courses gained a created_at once they had their own page.
alter table courses add column if not exists created_at timestamptz not null default now();

-- Cards are regenerated per section, so a stable key lets a re-run replace a
-- section's cards instead of duplicating them.
create index if not exists cards_section_idx on cards (section_id);
