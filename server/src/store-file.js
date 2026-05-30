import fs from 'node:fs';
import path from 'node:path';
import { MOCK_VENDORS, MOCK_INVENTORY } from './lib/mock-data.js';

// JSON file fallback store (used when Postgres is not configured/reachable).
// Persists to .data/store.json in the server working directory.

// DATA_DIR lets tests (and alternative deploys) point the file store at an
// isolated directory instead of the default ./.data in the cwd.
const DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const FILE = path.join(DIR, 'store.json');

function seed() {
  return {
    bookings: [],
    vendors: MOCK_VENDORS.map((v) => ({ ...v, created_at: new Date().toISOString() })),
    inventory: MOCK_INVENTORY.map((i) => ({ ...i })),
    tickets: [],
    admins: [],
    seq: 1,
  };
}

function read() {
  try {
    if (!fs.existsSync(FILE)) {
      const fresh = seed();
      write(fresh);
      return fresh;
    }
    const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    db.bookings ??= [];
    db.vendors ??= [];
    db.inventory ??= [];
    db.tickets ??= [];
    db.admins ??= [];
    db.seq ??= 1;
    return db;
  } catch {
    return seed();
  }
}

function write(db) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('file store write failed', e);
  }
}

export function getDB() {
  return read();
}

export function mutate(fn) {
  const db = read();
  const result = fn(db);
  write(db);
  return result;
}

export function nextId(prefix, db) {
  db.seq += 1;
  return `${prefix}-${db.seq}`;
}
