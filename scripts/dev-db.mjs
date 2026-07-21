/**
 * Local dev Postgres — a real Postgres server, no Docker or system install.
 * Data lives in .pgdata/ (gitignored). Ctrl-C stops it.
 *
 * Production uses a normal hosted Postgres; this only exists so `npm run dev`
 * works on a clean machine.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const DATA_DIR = "./.pgdata";
const PORT = 5433;
const DB = "marketplace";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const firstRun = !existsSync(DATA_DIR);
if (firstRun) {
  console.log("Initialising Postgres data directory…");
  await pg.initialise();
}

await pg.start();

try {
  await pg.createDatabase(DB);
  console.log(`Created database "${DB}".`);
} catch {
  // Already exists on subsequent runs — expected.
}

console.log(`
Postgres running on port ${PORT}.

  DATABASE_URL="postgresql://postgres:postgres@localhost:${PORT}/${DB}"

Leave this running and start the app in another terminal with: npm run dev
`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    console.log("\nStopping Postgres…");
    await pg.stop();
    process.exit(0);
  });
}
