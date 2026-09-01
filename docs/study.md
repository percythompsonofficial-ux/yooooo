# Study — lecture transcripts in, recall cards out

The lecture-to-recall system. It lives at `/study` and shares nothing with the
marketing sites in this repo beyond the Next app itself.

Paste a transcript; a background worker splits it into sections, writes
revision notes and recall cards for every section, and FSRS schedules them.

## Setup

```bash
cp .env.example .env.local     # fill in DATABASE_URL and ANTHROPIC_API_KEY
npm install
npm run db:migrate             # applies db/schema.sql, idempotent
npm run dev                    # /study
npm run jobs:work              # in a second terminal — see "The worker" below
```

`DATABASE_URL` is any Postgres — Neon and Supabase both work with their
default connection string. `ANTHROPIC_API_KEY` is only needed to *generate*;
reviewing and exporting work without it.

`npm run seed` is not wired up, but `npx tsx --env-file-if-exists=.env.local
scripts/seed.ts` creates a realistic course and lecture by running the real
pipeline with the model calls stubbed — useful for working on the UI without
spending anything.

## What it does

1. You paste a transcript at `/study` and pick a course. The lecture is
   **queued**, not generated on the spot, and you land on its page.
2. A **structure pass** splits the lecture into sections (heading + one-line
   thesis), and titles the lecture if you didn't.
3. That fans out: **one card job per section**, plus one **notes** job for the
   lecture. Roughly `sections + 2` model calls in total.
4. Every card must quote the transcript verbatim in `source_span`. Cards whose
   quote isn't actually in the transcript are **dropped before they are
   stored** — this is the check that catches a plausible, well-formed question
   about something the lecturer never said.
5. `/study/review` walks everything due. Space reveals, `1`–`4` rate, and FSRS
   sets the next due date.
6. `Export to Anki` produces a real `.apkg` for a lecture or a whole course.

### Why the fan-out is per section

Asking for a whole lecture's cards in one call degrades badly: past roughly a
dozen the model starts rephrasing earlier cards instead of covering new
ground, so you end up reviewing one idea six times and never seeing minute 58.
Each section gets its own call, capped at five cards, and they all share the
same cached transcript prefix — so the fan-out costs little more than a single
call would.

## The worker

Generation never runs inside a request. `ingestLecture` writes a row and
returns; `POST`/`GET /api/jobs/run` drains the queue.

- **Production**: `vercel.json` runs the cron every minute. `CRON_SECRET` is
  **required** — the endpoint spends money, so it refuses to run
  unauthenticated when `NODE_ENV=production`. Vercel Cron sends it as
  `Authorization: Bearer $CRON_SECRET`.
- **Locally**: `npm run jobs:work` polls in a loop, or `npm run jobs:once` for
  a single pass.

Each invocation stops at `JOB_BUDGET_MS` and reports `moreWork` so the next
tick continues, rather than being killed mid-job at the platform's hard limit.
A job that *is* cut off sits in `running` until `reclaimStale` returns it to
the queue ten minutes later. Failures retry with backoff (30s, 2m, 8m) three
times before the lecture is marked failed with the reason, and the lecture
page offers a retry.

`claim()` uses `FOR UPDATE SKIP LOCKED`, so overlapping cron invocations never
process the same job.

## Anki export

`/api/study/export?courseId=…` or `?lectureId=…` returns a real `.apkg`: a zip
holding an Anki schema-11 SQLite collection. Built with `sql.js`'s **asm.js**
build rather than the wasm one on purpose — no side-car `.wasm` file to
resolve, which is what breaks this inside a bundled serverless function.

Guids are derived from the card id, so re-exporting updates the existing notes
in Anki instead of duplicating them.

Scheduling crosses over approximately: a reviewed card exports with its
interval, due date, reps and lapses but a nominal ease factor, because FSRS
and Anki's scheduler don't model memory the same way. Unreviewed cards export
as new. **The app stays the source of truth for scheduling** — the export is
an escape hatch, not a sync.

## What it deliberately does not do yet

| Not here | Why, and what it needs |
|---|---|
| Auth | Single user, no login. Everything is world-readable if deployed. |
| Audio / captions / slides | `lectures.source_kind` records the intent; only `paste` is wired up. Check whether your LMS exports `.vtt` before building transcription. |
| Cumulative exam mode | Cards across a whole course, weighted by lapses. |
| Retention slider | `request_retention` is hardcoded at 0.9 in `scheduler.ts`. Exposing it per course is about four lines. |

## Layout

```
db/schema.sql              the whole data model, idempotent
scripts/migrate.ts         applies it
scripts/seed.ts            a realistic lecture via the real pipeline, stubbed model
scripts/work.ts            local stand-in for the production cron
lib/study/db.ts            pool + queries
lib/study/jobs.ts          the queue: claim, retry, reclaim, progress
lib/study/runner.ts        job handlers, the fan-out, and the drain loop
lib/study/scheduler.ts     ts-fsrs wrapper — no model calls live here
lib/study/generate.ts      the three passes + the grounding check
lib/study/anki.ts          .apkg builder
app/api/jobs/run/          the worker endpoint
app/api/study/export/      .apkg download
app/study/                 pages and server actions
components/study/          ingest form, review session, progress, markdown
```

### Decisions worth knowing before you change things

**`cards` and `card_state` are separate tables on purpose.** `cards` is
immutable generated content; `card_state` is scheduling that gets rewritten on
every review. Keeping them apart means you can regenerate a lecture's cards
without losing review history. `card_state`'s columns mirror the `ts-fsrs`
`Card` interface exactly (including `scheduled_days` and `learning_steps`) so a
row round-trips through the scheduler without reconstruction.

**A review session walks a snapshot.** `rateCard` deliberately does *not* call
`refresh()`. Refreshing mid-session re-runs the server component, hands the
client a shorter queue, and the index then points past cards that were never
shown. The session refreshes once, on its way out.

When the queue read eventually moves behind `use cache`, `updateTag('queue')`
becomes the correct call for read-your-writes. That needs `cacheComponents` in
`next.config.ts`, which changes rendering semantics for the marketing sites in
this repo too — so it is still deliberately deferred.

**Notes are rendered as React elements, never as HTML.** `components/study/
Markdown.tsx` is a small purpose-built renderer rather than a markdown library
plus `dangerouslySetInnerHTML`. The notes are model output derived from a
transcript the user pasted, so injecting them as HTML would make a lecture
transcript an XSS vector.

**The three model calls sit behind one seam.** `drain({ generators })` in
`runner.ts` lets tests substitute them, so the fan-out, grounding, card
replacement and status derivation all run for real against Postgres without
spending anything. That is what `study:smoke:pipeline` exercises.

## Checks

```bash
npm run db:migrate            # schema applies cleanly
npm run study:smoke           # storage + FSRS loop, all four ratings
npm run study:smoke:jobs      # queue: concurrency, retry/backoff, reclaim
npm run study:smoke:anki      # builds an .apkg and reads it back
npm run study:smoke:pipeline  # the whole flow, model calls stubbed
npm run build
```

Each suite creates its own throwaway data and cleans up after itself.

- `study:smoke:jobs` races twelve workers for eight jobs and asserts no job is
  claimed twice and no worker blocks.
- `study:smoke:anki` unzips its own output, opens the SQLite collection, and
  checks Anki's invariants — field separators, the sha1 checksum, HTML
  escaping, and guid stability across two builds.
- `study:smoke:pipeline` runs queue → structure → fan-out → cards + notes →
  status → review queue → export, asserting that ungrounded cards never reach
  the database and that a re-run replaces a section's cards rather than
  duplicating them.
