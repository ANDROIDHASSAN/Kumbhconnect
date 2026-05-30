import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOCK_VENDORS, MOCK_INVENTORY } from './lib/mock-data.js';
import { DEMO_CUSTOMERS, DEMO_BOOKINGS, DEMO_TICKETS, DEMO_PROMOTIONS } from './lib/demo-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Apply every migration in order. Idempotent (CREATE … IF NOT EXISTS + guards). */
export async function runMigrations(pool) {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
}

const count = async (pool, table) => (await pool.query(`select count(*)::int as n from ${table}`)).rows[0].n;
const daysAgoIso = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
const commissionOf = (amount) => Math.round((Number(amount) || 0) * 0.12);

/**
 * Populate the database with demo data. Each table is seeded independently and
 * only when empty, so this is safe to run on every boot — it fills gaps without
 * ever duplicating rows. Returns true if anything was inserted.
 */
export async function seedIfEmpty(pool) {
  let seeded = false;

  // ── Vendors ──
  if ((await count(pool, 'vendors')) === 0) {
    for (const v of MOCK_VENDORS) {
      await pool.query(
        `insert into vendors (type,name,area,lat,lng,rates_json,capacity,kyc_status,rating,active)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [v.type, v.name, v.area, v.lat, v.lng, v.rates_json, v.capacity, v.kyc_status, v.rating, v.active],
      );
    }
    seeded = true;
  }

  // Name → id map for linking inventory / bookings / promotions to vendors.
  const vendorByName = new Map((await pool.query('select id, name from vendors')).rows.map((r) => [r.name, r.id]));

  // ── Inventory ──
  if ((await count(pool, 'inventory')) === 0) {
    const mockIdToName = new Map(MOCK_VENDORS.map((v) => [v.id, v.name]));
    for (const i of MOCK_INVENTORY) {
      const vendorId = vendorByName.get(mockIdToName.get(i.vendor_id));
      if (!vendorId) continue;
      await pool.query(
        'insert into inventory (vendor_id,service_type,date,units_total,units_available,price) values ($1,$2,$3,$4,$5,$6)',
        [vendorId, i.service_type, i.date, i.units_total, i.units_available, i.price],
      );
    }
    seeded = true;
  }

  // ── Customers + bookings + advance payments (seeded together) ──
  if ((await count(pool, 'bookings')) === 0) {
    const customerIds = [];
    for (const c of DEMO_CUSTOMERS) {
      const r = await pool.query(
        'insert into customers (name,phone,language,party_size,segment) values ($1,$2,$3,$4,$5) returning id',
        [c.name, c.phone, c.language, c.party_size ?? null, c.segment ?? null],
      );
      customerIds.push(r.rows[0].id);
    }

    for (const b of DEMO_BOOKINGS) {
      const createdAt = daysAgoIso(b.days_ago);
      const r = await pool.query(
        `insert into bookings (customer_id,vendor_id,service_type,status,start_date,party_size,amount,commission,channel,notes,created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
        [
          customerIds[b.customer] ?? null,
          b.vendor ? vendorByName.get(b.vendor) ?? null : null,
          b.service_type, b.status, b.start_date ?? null, b.party_size ?? null,
          b.amount ?? null, commissionOf(b.amount), b.channel ?? 'web', b.notes ?? null, createdAt,
        ],
      );
      // Won bookings have a paid advance (20%); fulfilled also clears the balance.
      if (b.status === 'confirmed' || b.status === 'fulfilled') {
        const advance = Math.round((Number(b.amount) || 0) * 0.2);
        await pool.query(
          `insert into payments (booking_id,kind,amount,status,provider_ref,created_at) values ($1,'advance',$2,'paid',$3,$4)`,
          [r.rows[0].id, advance, `seed_adv_${r.rows[0].id.slice(0, 8)}`, createdAt],
        );
        if (b.status === 'fulfilled') {
          await pool.query(
            `insert into payments (booking_id,kind,amount,status,provider_ref,created_at) values ($1,'balance',$2,'paid',$3,$4)`,
            [r.rows[0].id, (Number(b.amount) || 0) - advance, `seed_bal_${r.rows[0].id.slice(0, 8)}`, createdAt],
          );
        }
      }
    }
    seeded = true;
  }

  // ── Support tickets ──
  if ((await count(pool, 'support_tickets')) === 0) {
    // Link tickets to seeded customers (best-effort, by insertion order).
    const customers = (await pool.query('select id from customers order by created_at')).rows;
    for (const tk of DEMO_TICKETS) {
      await pool.query(
        'insert into support_tickets (customer_id,category,channel,status,notes,created_at) values ($1,$2,$3,$4,$5,$6)',
        [customers[tk.customer]?.id ?? null, tk.category, tk.channel ?? 'web', tk.status ?? 'open', tk.notes ?? null, daysAgoIso(tk.days_ago)],
      );
    }
    seeded = true;
  }

  // ── Promotions ──
  if ((await count(pool, 'promotions')) === 0) {
    for (const p of DEMO_PROMOTIONS) {
      const vendorId = vendorByName.get(p.vendor);
      if (!vendorId) continue;
      const starts = new Date();
      const ends = new Date(Date.now() + p.durationDays * 86_400_000);
      await pool.query(
        'insert into promotions (vendor_id,tier,starts_at,ends_at,amount) values ($1,$2,$3,$4,$5)',
        [vendorId, p.tier, starts.toISOString(), ends.toISOString(), p.amount],
      );
    }
    seeded = true;
  }

  return seeded;
}
