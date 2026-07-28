import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

/**
 * The SQLite connection is a process-wide singleton.
 *
 * Next.js re-evaluates modules on every hot reload in development, which would
 * otherwise open a new connection (and re-run migrations) on each edit until
 * the file handles run out. Caching on `globalThis` survives module
 * re-evaluation; the module-level constant alone does not.
 */

const DB_FILE = process.env.DATABASE_URL ?? "./procurement.db";
const RESOLVED_DB_FILE = path.isAbsolute(DB_FILE)
  ? DB_FILE
  : path.join(process.cwd(), DB_FILE);
const MIGRATIONS_DIR = path.join(process.cwd(), "src", "db", "migrations");

/**
 * `npm run db:clear` drops the database and leaves this marker behind so the
 * next seed only writes reference data (users, departments, vendors, ...) and
 * skips the demo purchase requests, canvassing, and activity history — the
 * app needs at least a signed-in user to function, so a fully empty database
 * isn't a usable state. `npm run db:reset` removes the marker along with the
 * database, since a reset is meant to come back with fresh demo data.
 */
const NO_SEED_MARKER = `${RESOLVED_DB_FILE}.no-seed`;

type DrizzleDb = ReturnType<typeof createConnection>;

interface DbCache {
  db: DrizzleDb;
  seeded: boolean;
}

const globalCache = globalThis as typeof globalThis & {
  __procurementDb?: DbCache;
};

function createConnection() {
  const sqlite = new Database(RESOLVED_DB_FILE);

  // WAL keeps reads from blocking on the write that seeding performs.
  sqlite.pragma("journal_mode = WAL");
  // Off by default in SQLite; without it the schema's references are inert.
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

function init(): DbCache {
  if (globalCache.__procurementDb) return globalCache.__procurementDb;

  const db = createConnection();
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });

  const cache: DbCache = { db, seeded: false };
  globalCache.__procurementDb = cache;
  return cache;
}

/**
 * The Drizzle handle. Migrations run once per process, before first use.
 *
 * Seeding is deliberately not triggered here: `seedIfEmpty` imports the
 * fixtures, and importing those from every repository would pull the seed data
 * into every request path. `ensureDatabaseReady` is the entry point that does
 * both, and route handlers go through it.
 */
export const db: DrizzleDb = init().db;

export { schema };

/**
 * Runs migrations and seeds the database if it is empty. Safe to call on every
 * request — the seeding check is skipped once it has succeeded in this process.
 */
export async function ensureDatabaseReady(): Promise<void> {
  const cache = init();
  if (cache.seeded) return;

  const { seedIfEmpty } = await import("./seed");
  const mode = fs.existsSync(NO_SEED_MARKER) ? "master" : "full";
  await seedIfEmpty(cache.db, mode);
  cache.seeded = true;
}
