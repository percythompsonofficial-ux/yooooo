/**
 * Applies db/schema.sql. Idempotent — run it as often as you like.
 *   npm run db:migrate
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  try {
    const sql = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
    await pool.query(sql);
    const { rows } = await pool.query<{ table_name: string }>(
      `select table_name from information_schema.tables
        where table_schema = 'public' order by table_name`,
    );
    console.log(`Applied db/schema.sql — ${rows.length} tables:`);
    for (const r of rows) console.log(`  ${r.table_name}`);
  } catch (err) {
    console.error("Migration failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
