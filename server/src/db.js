import pg from 'pg';
import { runMigrations, seedIfEmpty } from './bootstrap.js';

let pool = null;
let usingPg = false;
let lastError = null; // most recent connection failure, surfaced via /api/health

function needsSsl(url) {
  // Managed Postgres (Render/Neon/Supabase) needs SSL; localhost does not.
  if (process.env.DATABASE_SSL === 'false') return false;
  if (process.env.DATABASE_SSL === 'true') return true;
  if (/sslmode=require/.test(url)) return true;
  return !/@(localhost|127\.0\.0\.1)/.test(url);
}

/** Initialise Postgres, auto-migrate + seed-if-empty. Falls back to file store. */
export async function initDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('ℹ  No DATABASE_URL — using JSON file store (.data/store.json).');
    return { usingPg: false };
  }
  pool = new pg.Pool({
    connectionString: url,
    max: 10,
    ssl: needsSsl(url) ? { rejectUnauthorized: false } : false,
  });
  // Surface pool-level errors (e.g. the DB going away) instead of crashing.
  pool.on('error', (e) => { lastError = e.message; });
  try {
    // Retry the initial connect so a transient hiccup at startup doesn't strand
    // the whole server on the file store until the next restart.
    const ATTEMPTS = Number(process.env.DB_CONNECT_ATTEMPTS) || 3;
    for (let attempt = 1; ; attempt++) {
      try {
        await pool.query('select 1');
        break;
      } catch (e) {
        lastError = e.message;
        if (attempt >= ATTEMPTS) throw e;
        console.warn(`⚠  Postgres connect attempt ${attempt}/${ATTEMPTS} failed (${e.message}); retrying in 1.5s…`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    await runMigrations(pool);
    const seeded = await seedIfEmpty(pool);
    usingPg = true;
    lastError = null;
    console.log(`✓ Connected to Postgres${seeded ? ' (schema applied + sample data seeded)' : ''}.`);
  } catch (e) {
    lastError = e.message;
    console.warn(`⚠  Postgres unavailable (${e.message}). Falling back to JSON file store.`);
    pool = null;
    usingPg = false;
  }
  return { usingPg };
}

/**
 * Live connectivity probe for /api/health. Runs an actual `select` against the
 * pool so you can confirm the DB is reachable right now (not just at boot) and
 * see the exact error when it isn't.
 */
export async function pingDb() {
  const configured = Boolean(process.env.DATABASE_URL);
  if (!pool) {
    return { configured, connected: false, error: configured ? lastError ?? 'not connected' : null };
  }
  try {
    const { rows } = await pool.query('select version() as version, current_database() as database');
    return {
      connected: true,
      configured: true,
      database: rows[0].database,
      version: String(rows[0].version).split(' ').slice(0, 2).join(' '), // e.g. "PostgreSQL 17.2"
      error: null,
    };
  } catch (e) {
    return { configured, connected: false, error: e.message };
  }
}

export function getPool() {
  return pool;
}
export function isPg() {
  return usingPg;
}
