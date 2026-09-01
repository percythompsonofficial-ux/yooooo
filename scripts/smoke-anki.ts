/**
 * Builds an .apkg and reads it back — unzips it, opens the embedded SQLite
 * collection, and checks Anki's invariants.
 *   npm run study:smoke:anki
 */
import { writeFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
import initSqlJs from "sql.js/dist/sql-asm.js";
import { buildApkg, type ExportCard } from "../lib/study/anki";

let failures = 0;
const ok = (l: string, c: boolean, d = "") => {
  console.log(`${c ? "  ok  " : "  FAIL"}  ${l}${d ? ` — ${d}` : ""}`);
  if (!c) failures++;
};

const CARDS: ExportCard[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    prompt: "What is the rate-determining step of an E1 reaction?",
    answer: "Formation of the carbocation.",
    distractors: null, kind: "recall",
    source_span: "the rate-determining step is formation of the carbocation",
    heading: "Rate and mechanism", lecture_title: "Week 4 — E1 elimination",
    course_name: "Organic Chemistry II",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    prompt: "E1 rate depends on the concentration of:",
    answer: "the substrate only",
    distractors: ["the base only", "both substrate and base", "the solvent"],
    kind: "mcq", source_span: "depends only on the concentration of the substrate",
    heading: "Rate and mechanism", lecture_title: "Week 4 — E1 elimination",
    course_name: "Organic Chemistry II",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    prompt: 'Zaitsev & "the major product" <test> — escaping?',
    answer: "The more substituted alkene.",
    distractors: null, kind: "recall",
    source_span: "the more substituted alkene is the major product",
    heading: "Products", lecture_title: "Week 4 — E1 elimination",
    course_name: "Organic Chemistry II",
    // a reviewed card: scheduling should carry across
    state: 2, due: new Date(Date.now() + 8 * 86_400_000),
    scheduled_days: 8, reps: 3, lapses: 1,
  },
];

async function main() {
  const bytes = await buildApkg(CARDS, "Study::Organic Chemistry II");
  ok("apkg has bytes", bytes.byteLength > 1000, `${bytes.byteLength} bytes`);
  writeFileSync(process.env.OUT ?? "/tmp/study.apkg", bytes);

  // zip magic
  ok("starts with the zip signature",
     bytes[0] === 0x50 && bytes[1] === 0x4b, `${bytes[0]},${bytes[1]}`);

  const entries = unzipSync(bytes);
  ok("contains collection.anki2", "collection.anki2" in entries);
  ok("contains a media manifest", "media" in entries);
  ok("media manifest is empty json", strFromU8(entries["media"]) === "{}");

  const col = entries["collection.anki2"];
  ok("collection is a SQLite file",
     strFromU8(col.slice(0, 15)) === "SQLite format 3", strFromU8(col.slice(0, 15)));

  // reopen it the way Anki would
  const SQL = await initSqlJs({});
  const db = new SQL.Database(col) as unknown as {
    exec: (s: string) => { columns: string[]; values: unknown[][] }[];
    close: () => void;
  };
  const one = (sql: string) => db.exec(sql)[0]?.values?.[0];

  ok("schema version is 11", Number(one("select ver from col")?.[0]) === 11);
  ok("note count matches", Number(one("select count(*) from notes")?.[0]) === 3);
  ok("card count matches", Number(one("select count(*) from cards")?.[0]) === 3);
  ok("every card points at a real note",
     Number(one("select count(*) from cards c left join notes n on n.id=c.nid where n.id is null")?.[0]) === 0);

  const models = JSON.parse(String(one("select models from col")?.[0]));
  const model = Object.values(models)[0] as { flds: unknown[]; tmpls: unknown[] };
  ok("model declares 3 fields", model.flds.length === 3, String(model.flds.length));
  ok("model has a template", model.tmpls.length === 1);

  const decks = JSON.parse(String(one("select decks from col")?.[0]));
  const names = Object.values(decks).map((d) => (d as { name: string }).name);
  ok("deck is named for the course",
     names.includes("Study::Organic Chemistry II"), names.join(", "));

  // fields are separated by the 0x1f unit separator, three per note
  const fldRows = db.exec("select flds from notes")[0].values as string[][];
  ok("every note has exactly 3 separated fields",
     fldRows.every((r) => r[0].split("\x1f").length === 3));

  // checksum must match Anki's definition or the importer rejects dedupe
  const csumRow = db.exec("select flds, csum, sfld from notes limit 1")[0].values[0] as [string, number, string];
  const { createHash } = await import("node:crypto");
  const first = csumRow[0].split("\x1f")[0];
  const expect = parseInt(
    createHash("sha1").update(first.replace(/<[^>]+>/g, ""), "utf8").digest("hex").slice(0, 8), 16);
  ok("csum is sha1-derived as Anki expects", Number(csumRow[1]) === expect,
     `${csumRow[1]} vs ${expect}`);
  ok("sort field equals the first field", csumRow[2] === first);

  // guids must be unique and stable across builds
  const guids = (db.exec("select guid from notes")[0].values as string[][]).map((r) => r[0]);
  ok("guids are unique", new Set(guids).size === 3);

  // html escaping
  const escaped = db.exec(
    `select flds from notes where flds like '%Zaitsev%'`)[0].values[0][0] as string;
  ok("special characters are html-escaped, not raw",
     escaped.includes("&amp;") && escaped.includes("&lt;test&gt;") && !escaped.includes("<test>"),
     escaped.split("\x1f")[0].slice(0, 56));

  // mcq options rendered into the front
  const mcq = db.exec(`select flds from notes where flds like '%<ul>%'`)[0].values[0][0] as string;
  ok("mcq front lists all four options", (mcq.match(/<li>/g) ?? []).length === 4);

  // scheduling carried across for the reviewed card
  const rev = db.exec("select type, queue, ivl, reps, lapses from cards where type = 2")[0]?.values?.[0];
  ok("the reviewed card exports as a review card", !!rev, JSON.stringify(rev));
  if (rev) {
    ok("its interval survives", Number(rev[2]) === 8, String(rev[2]));
    ok("its reps and lapses survive", Number(rev[3]) === 3 && Number(rev[4]) === 1);
  }
  const news = db.exec("select count(*) from cards where type = 0")[0].values[0][0];
  ok("unreviewed cards export as new", Number(news) === 2, String(news));

  db.close();

  // stability: a second build of the same cards keeps the same guids
  const again = await buildApkg(CARDS, "Study::Organic Chemistry II");
  const db2 = new SQL.Database(unzipSync(again)["collection.anki2"]) as unknown as {
    exec: (s: string) => { values: unknown[][] }[]; close: () => void };
  const guids2 = (db2.exec("select guid from notes")[0].values as string[][]).map((r) => r[0]);
  db2.close();
  ok("guids are stable across exports — re-import updates, not duplicates",
     JSON.stringify(guids.slice().sort()) === JSON.stringify(guids2.slice().sort()));

  console.log(failures === 0 ? "\nAll apkg checks passed.\n" : `\n${failures} FAILED\n`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
