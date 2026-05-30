import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('✗ DATABASE_URL not set. Start Postgres (docker compose up -d) and set server/.env.');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '0001_init.sql'), 'utf8');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  console.log('→ Running migration 0001_init.sql …');
  await pool.query(sql);
  console.log('✓ Migration complete.');
  await pool.end();
}

main().catch((e) => {
  console.error('✗ Migration failed:', e.message);
  process.exit(1);
});
