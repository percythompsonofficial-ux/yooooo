import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import initSqlJs from "sql.js/dist/sql-asm.js";

/**
 * Builds a real Anki .apkg: a zip holding `collection.anki2`, a SQLite
 * database in Anki's schema 11, plus an empty `media` manifest.
 *
 * The asm.js build of sql.js is used rather than the wasm one on purpose —
 * it needs no side-car .wasm file to resolve at runtime, which is what
 * breaks this kind of thing inside a bundled serverless function.
 *
 * Scheduling is carried across approximately. FSRS and Anki's scheduler do
 * not model memory the same way, so a reviewed card exports with its current
 * interval and due date but a nominal ease factor; unreviewed cards export as
 * new. The app remains the source of truth for scheduling — this is an
 * escape hatch, not a sync.
 */

const MODEL_ID = 1700000000000;
const DECK_BASE_ID = 1700000000001;
const SCHEMA_VERSION = 11;

export type ExportCard = {
  id: string;
  prompt: string;
  answer: string;
  distractors: string[] | null;
  source_span: string;
  kind: string;
  heading: string;
  lecture_title: string;
  course_name: string;
  /** Scheduling, when the card has been reviewed. */
  state?: number;
  due?: Date;
  scheduled_days?: number;
  reps?: number;
  lapses?: number;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Anki's field checksum: first 8 hex digits of the sha1 of field 1. */
function fieldChecksum(text: string): number {
  const stripped = text.replace(/<[^>]+>/g, "");
  const hex = createHash("sha1").update(stripped, "utf8").digest("hex");
  return parseInt(hex.slice(0, 8), 16);
}

/**
 * Deterministic guid from the card's uuid. Anki dedupes on guid, so a
 * re-export of the same card updates the existing note instead of adding a
 * duplicate — which is the behaviour you want when you export twice.
 */
function guidFor(cardId: string): string {
  return Buffer.from(cardId.replace(/-/g, ""), "hex")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function frontFor(card: ExportCard): string {
  const q = escapeHtml(card.prompt);
  if (card.kind !== "mcq" || !card.distractors?.length) return q;
  const options = [card.answer, ...card.distractors]
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((o) => `<li>${escapeHtml(o)}</li>`)
    .join("");
  return `${q}<ul>${options}</ul>`;
}

const MODEL_CSS = `.card {
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 18px;
  text-align: left;
  color: #1c1917;
  background: #fafaf9;
  padding: 18px;
}
.src { color: #78716c; font-size: 13px; font-style: italic; margin-top: 12px; }
ul { margin: 10px 0 0 18px; }`;

function models(deckName: string) {
  return {
    [MODEL_ID]: {
      id: MODEL_ID,
      name: "Study — Lecture card",
      type: 0,
      mod: Math.floor(Date.now() / 1000),
      usn: -1,
      sortf: 0,
      did: DECK_BASE_ID,
      tmpls: [
        {
          name: "Recall",
          ord: 0,
          qfmt: "{{Front}}",
          afmt: '{{FrontSide}}<hr id="answer">{{Back}}<div class="src">{{Source}}</div>',
          bqfmt: "",
          bafmt: "",
          did: null,
          bfont: "",
          bsize: 0,
        },
      ],
      flds: [
        { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        { name: "Source", ord: 2, sticky: false, rtl: false, font: "Arial", size: 14, media: [] },
      ],
      css: MODEL_CSS,
      latexPre: "",
      latexPost: "",
      latexsvg: false,
      req: [[0, "any", [0]]],
      tags: [],
      vers: [],
      deckName,
    },
  };
}

function decks(deckName: string) {
  return {
    "1": {
      id: 1, name: "Default", mod: 0, usn: 0, lrnToday: [0, 0], revToday: [0, 0],
      newToday: [0, 0], timeToday: [0, 0], collapsed: true, browserCollapsed: true,
      desc: "", dyn: 0, conf: 1, extendNew: 0, extendRev: 0,
    },
    [DECK_BASE_ID]: {
      id: DECK_BASE_ID, name: deckName, mod: Math.floor(Date.now() / 1000), usn: -1,
      lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0],
      collapsed: false, browserCollapsed: false, desc: "Exported from the study app.",
      dyn: 0, conf: 1, extendNew: 10, extendRev: 50,
    },
  };
}

const DCONF = {
  "1": {
    id: 1, name: "Default", mod: 0, usn: 0, maxTaken: 60, autoplay: true,
    timer: 0, replayq: true, dyn: false,
    new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7],
           order: 1, perDay: 20, separate: true },
    rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500,
           minSpace: 1, perDay: 200, hardFactor: 1.2 },
    lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
  },
};

const SCHEMA = `
create table col (
  id integer primary key, crt integer not null, mod integer not null,
  scm integer not null, ver integer not null, dty integer not null,
  usn integer not null, ls integer not null, conf text not null,
  models text not null, decks text not null, dconf text not null, tags text not null
);
create table notes (
  id integer primary key, guid text not null, mid integer not null,
  mod integer not null, usn integer not null, tags text not null,
  flds text not null, sfld integer not null, csum integer not null,
  flags integer not null, data text not null
);
create table cards (
  id integer primary key, nid integer not null, did integer not null,
  ord integer not null, mod integer not null, usn integer not null,
  type integer not null, queue integer not null, due integer not null,
  ivl integer not null, factor integer not null, reps integer not null,
  lapses integer not null, left integer not null, odue integer not null,
  odid integer not null, flags integer not null, data text not null
);
create table revlog (
  id integer primary key, cid integer not null, usn integer not null,
  ease integer not null, ivl integer not null, lastIvl integer not null,
  factor integer not null, time integer not null, type integer not null
);
create table graves (usn integer not null, oid integer not null, type integer not null);
create index ix_notes_usn on notes (usn);
create index ix_cards_usn on cards (usn);
create index ix_revlog_usn on revlog (usn);
create index ix_cards_nid on cards (nid);
create index ix_cards_sched on cards (did, queue, due);
create index ix_revlog_cid on revlog (cid);
create index ix_notes_csum on notes (csum);
`;

function slugTag(s: string): string {
  return s.trim().replace(/\s+/g, "_").replace(/[^\w:-]/g, "").slice(0, 60) || "untitled";
}

export async function buildApkg(
  cards: ExportCard[],
  deckName: string,
): Promise<Uint8Array> {
  const SQL = await initSqlJs({});
  const db = new SQL.Database();
  db.run(SCHEMA);

  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  // Anki counts review due dates in days since the collection was created.
  const crt = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000);

  db.run(
    `insert into col values (1, ?, ?, ?, ?, 0, -1, 0, ?, ?, ?, ?, '{}')`,
    [
      crt, nowSec, nowSec * 1000, SCHEMA_VERSION,
      JSON.stringify({
        nextPos: 1, estTimes: true, activeDecks: [1], sortType: "noteFld",
        timeLim: 0, sortBackwards: false, addToCur: true, curDeck: 1,
        newBury: true, newSpread: 0, dueCounts: true,
        curModel: String(MODEL_ID), collapseTime: 1200,
      }),
      JSON.stringify(models(deckName)),
      JSON.stringify(decks(deckName)),
      JSON.stringify(DCONF),
    ],
  );

  const insertNote = db.prepare(
    `insert into notes values (?, ?, ?, ?, -1, ?, ?, ?, ?, 0, '')`,
  );
  const insertCard = db.prepare(
    `insert into cards values (?, ?, ?, 0, ?, -1, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, '')`,
  );

  cards.forEach((card, i) => {
    const noteId = nowMs + i;
    const cardId = noteId + 500000;

    const front = frontFor(card);
    const back = escapeHtml(card.answer);
    const source = escapeHtml(card.source_span);
    const flds = [front, back, source].join("\x1f");
    const tags = ` ${slugTag(card.lecture_title)} ${slugTag(card.heading)} ${slugTag(card.kind)} `;

    insertNote.run([
      noteId, guidFor(card.id), MODEL_ID, nowSec, tags, flds, front,
      fieldChecksum(front),
    ]);

    // Reviewed cards carry their interval across; everything else is new.
    const reviewed = (card.state ?? 0) >= 2 && card.due instanceof Date;
    if (reviewed) {
      const daysOut = Math.max(
        0,
        Math.round((card.due!.getTime() - nowMs) / 86_400_000),
      );
      const dueDay = Math.floor((nowMs / 1000 - crt) / 86400) + daysOut;
      insertCard.run([
        cardId, noteId, DECK_BASE_ID, nowSec,
        2, 2, dueDay,
        Math.max(1, card.scheduled_days ?? (daysOut || 1)),
        2500, card.reps ?? 0, card.lapses ?? 0,
      ]);
    } else {
      insertCard.run([
        cardId, noteId, DECK_BASE_ID, nowSec,
        0, 0, i + 1, 0, 0, card.reps ?? 0, card.lapses ?? 0,
      ]);
    }
  });

  insertNote.free();
  insertCard.free();

  const collection = db.export();
  db.close();

  return zipSync(
    {
      "collection.anki2": collection,
      media: strToU8("{}"),
    },
    { level: 6 },
  );
}
