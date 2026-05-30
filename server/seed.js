import 'dotenv/config';
import pg from 'pg';
import { MOCK_VENDORS, MOCK_INVENTORY } from './src/lib/mock-data.js';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('✗ DATABASE_URL not set. The app works on the JSON file store without seeding.');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  console.log('→ Clearing existing vendors/inventory …');
  await pool.query('truncate inventory, vendors restart identity cascade');

  console.log('→ Seeding vendors …');
  const nameToId = new Map();
  for (const v of MOCK_VENDORS) {
    const { rows } = await pool.query(
      `insert into vendors (type,name,area,lat,lng,rates_json,capacity,kyc_status,rating,active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
      [v.type, v.name, v.area, v.lat, v.lng, v.rates_json, v.capacity, v.kyc_status, v.rating, v.active],
    );
    nameToId.set(v.name, rows[0].id);
  }
  console.log(`  ✓ ${MOCK_VENDORS.length} vendors`);

  console.log('→ Seeding inventory …');
  const mockIdToName = new Map(MOCK_VENDORS.map((v) => [v.id, v.name]));
  let n = 0;
  for (const i of MOCK_INVENTORY) {
    const vendorId = nameToId.get(mockIdToName.get(i.vendor_id));
    if (!vendorId) continue;
    await pool.query(
      'insert into inventory (vendor_id,service_type,date,units_total,units_available,price) values ($1,$2,$3,$4,$5,$6)',
      [vendorId, i.service_type, i.date, i.units_total, i.units_available, i.price],
    );
    n++;
  }
  console.log(`  ✓ ${n} inventory rows`);
  console.log('✓ Seed complete.');
  await pool.end();
}

main().catch((e) => {
  console.error('✗ Seed failed:', e.message);
  process.exit(1);
});
