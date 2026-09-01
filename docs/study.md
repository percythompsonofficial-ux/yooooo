# Study — lecture transcripts in, recall cards out

Phase one of the lecture-to-recall system. It lives at `/study` and shares
nothing with the marketing sites in this repo beyond the Next app itself.

The point of phase one is to answer one question cheaply: **are the generated
cards worth reviewing?** Everything else is deferred.

## Setup

```bash
cp .env.example .env.local     # fill in DATABASE_URL and ANTHROPIC_API_KEY
npm install
npm run db:migrate             # applies db/schema.sql, idempotent
npm run dev                    # /study
```

`DATABASE_URL` is any Postgres — Neon and Supabase both work with their
default connection string. `ANTHROPIC_API_KEY` is only needed to *generate*
cards; reviewing existing ones works without it.

## What it does

1. You paste a transcript at `/study`.
2. A **structure pass** splits the lecture into sections (heading + one-line
   thesis).
3. A **card pass** writes 3–5 cards for the *first section only*.
4. Every card must quote the transcript verbatim in `source_span`. Cards whose
   quote isn't actually in the transcript are **dropped before they are
   stored** — this is the check that catches a plausible, well-formed question
   about something the lecturer never said.
5. `/study/review` walks everything due. Space reveals, `1`–`4` rate, and FSRS
   sets the next due date.

Two model calls per lecture, so it fits inside a normal request.

## What it deliberately does not do yet

| Not here | Why, and what it needs |
|---|---|
| Cards for every section | The per-section fan-out is phase two, and it must move to a background job first — a full lecture takes minutes and a serverless function will be killed partway, leaving a half-generated lecture and no error. `lectures.status` already exists for this. |
| Courses | Everything lands in a single seeded `Unfiled` course row. The `courses` table is already there, so adding the UI doesn't need a migration. |
| Auth | Single user, no login. |
| Notes | The `notes` table exists; nothing writes to it yet. |
| Audio / captions / slides | `lectures.source_kind` records the intent; only `paste` is wired up. |
| Anki export | Worth doing early in phase two — it stops a semester of cards from being trapped in a side project. |

## Layout

```
db/schema.sql              the whole data model, idempotent
scripts/migrate.ts         applies it
scripts/seed.ts            a fixture lecture, no model calls
lib/study/db.ts            pool + queries
lib/study/scheduler.ts     ts-fsrs wrapper — no model calls live here
lib/study/generate.ts      the two passes + the grounding check
app/study/                 pages and server actions
components/study/          the ingest form and the review session
```

### Two decisions worth knowing before you change things

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
this repo too — so it is a deliberate phase-two decision, not a default.

## Checks

```bash
npm run db:migrate    # schema applies cleanly
npm run study:smoke   # storage + FSRS loop end to end, no model calls
npm run build
```

`study:smoke` creates a throwaway lecture, drives cards through all four
ratings, asserts the due dates move in the right order, that rated cards leave
the queue, and that deleting a lecture cascades — then cleans up after itself.
