import { getPool, isPg } from './db.js';
import { getDB, mutate, nextId } from './store-file.js';
import { INDICATIVE_FROM } from './lib/services.js';
import { hashPassword } from './lib/auth.js';

const now = () => new Date().toISOString();
const q = (text, params) => getPool().query(text, params);

export function vendorFromPrice(vendor) {
  const rates = vendor.rates_json ? Object.values(vendor.rates_json) : [];
  if (rates.length) return Math.min(...rates);
  return INDICATIVE_FROM[vendor.type] ?? 0;
}

// ── Vendors ───────────────────────────────────────────────────

export async function getVendorsByType(type) {
  if (isPg()) {
    const { rows } = await q(
      'select * from vendors where type=$1 and active=true order by rating desc nulls last',
      [type],
    );
    return rows;
  }
  return getDB()
    .vendors.filter((v) => v.type === type && v.active)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

export async function listVendors() {
  if (isPg()) {
    const { rows } = await q('select * from vendors order by created_at desc');
    return rows;
  }
  return [...getDB().vendors].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function createVendorSignup(input) {
  if (isPg()) {
    const { rows } = await q(
      `insert into vendors (type,name,area,capacity,kyc_status,active)
       values ($1,$2,$3,$4,'pending',false) returning *`,
      [input.type, input.name, input.area, input.capacity ?? null],
    );
    return rows[0];
  }
  return mutate((db) => {
    const v = { id: nextId('v', db), type: input.type, name: input.name, area: input.area, lat: null, lng: null, rates_json: null, capacity: input.capacity ?? null, kyc_status: 'pending', rating: null, active: false, created_at: now() };
    db.vendors.unshift(v);
    return v;
  });
}

export async function adminCreateVendor(input) {
  const rates = input.price ? { base: Number(input.price) } : null;
  if (isPg()) {
    const { rows } = await q(
      `insert into vendors (type,name,area,capacity,rates_json,kyc_status,active,image_url)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [input.type, input.name, input.area, input.capacity ?? null, rates, input.kyc_status ?? 'pending', input.active ?? false, input.image_url ?? null],
    );
    return rows[0];
  }
  return mutate((db) => {
    const v = { id: nextId('v', db), type: input.type, name: input.name, area: input.area, lat: null, lng: null, rates_json: rates, capacity: input.capacity ?? null, kyc_status: input.kyc_status ?? 'pending', rating: null, active: input.active ?? false, image_url: input.image_url ?? null, created_at: now() };
    db.vendors.unshift(v);
    return v;
  });
}

const VENDOR_COLS = ['active', 'kyc_status', 'name', 'area', 'capacity', 'rating', 'image_url'];

export async function updateVendor(id, patch) {
  if (isPg()) {
    const keys = Object.keys(patch).filter((k) => VENDOR_COLS.includes(k));
    if (!keys.length) return;
    const set = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
    await q(`update vendors set ${set} where id=$1`, [id, ...keys.map((k) => patch[k])]);
    return;
  }
  mutate((db) => {
    const v = db.vendors.find((x) => x.id === id);
    if (v) Object.assign(v, patch);
  });
}

export async function deleteVendor(id) {
  if (isPg()) {
    await q('delete from vendors where id=$1', [id]);
    return;
  }
  mutate((db) => {
    db.vendors = db.vendors.filter((v) => v.id !== id);
  });
}

// ── Inventory ─────────────────────────────────────────────────

export async function getInventoryForVendor(vendorId) {
  if (isPg()) {
    const { rows } = await q('select * from inventory where vendor_id=$1 and units_available>0 order by date', [vendorId]);
    return rows;
  }
  return getDB().inventory.filter((i) => i.vendor_id === vendorId && i.units_available > 0);
}

// ── Bookings / leads ──────────────────────────────────────────

export async function createLead(input) {
  const amount = (INDICATIVE_FROM[input.service_type] ?? 0) * (input.party_size ?? 1);
  const commission = Math.round(amount * 0.12);
  if (isPg()) {
    const cust = await q(
      'insert into customers (name,phone,language,party_size) values ($1,$2,$3,$4) returning id',
      [input.name, input.phone, input.language ?? 'en', input.party_size ?? null],
    );
    const { rows } = await q(
      `insert into bookings (customer_id,service_type,status,start_date,end_date,party_size,amount,commission,channel,notes)
       values ($1,$2,'lead',$3,$4,$5,$6,$7,$8,$9) returning *`,
      [cust.rows[0].id, input.service_type, input.start_date ?? null, input.end_date ?? null, input.party_size ?? null, amount || null, commission || null, input.channel ?? 'web', input.notes ?? null],
    );
    return { ...rows[0], customer_name: input.name, customer_phone: input.phone, area: input.area };
  }
  return mutate((db) => {
    const b = { id: nextId('bk', db), customer_id: null, vendor_id: null, service_type: input.service_type, status: 'lead', start_date: input.start_date ?? null, end_date: input.end_date ?? null, party_size: input.party_size ?? null, amount: amount || null, commission: commission || null, channel: input.channel ?? 'web', notes: input.notes ?? null, created_at: now(), customer_name: input.name, customer_phone: input.phone, area: input.area };
    db.bookings.unshift(b);
    return b;
  });
}

export async function adminCreateBooking(input) {
  const amount = input.amount ?? (INDICATIVE_FROM[input.service_type] ?? 0) * (input.party_size ?? 1);
  const commission = Math.round((amount || 0) * 0.12);
  if (isPg()) {
    const cust = await q('insert into customers (name,phone,language,party_size) values ($1,$2,$3,$4) returning id', [input.name, input.phone, 'en', input.party_size ?? null]);
    const { rows } = await q(
      `insert into bookings (customer_id,service_type,status,start_date,party_size,amount,commission,channel)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [cust.rows[0].id, input.service_type, input.status ?? 'lead', input.start_date ?? null, input.party_size ?? null, amount || null, commission || null, input.channel ?? 'phone'],
    );
    return { ...rows[0], customer_name: input.name, customer_phone: input.phone, area: input.area };
  }
  return mutate((db) => {
    const b = { id: nextId('bk', db), customer_id: null, vendor_id: null, service_type: input.service_type, status: input.status ?? 'lead', start_date: input.start_date ?? null, end_date: null, party_size: input.party_size ?? null, amount: amount || null, commission: commission || null, channel: input.channel ?? 'phone', notes: null, created_at: now(), customer_name: input.name, customer_phone: input.phone, area: input.area };
    db.bookings.unshift(b);
    return b;
  });
}

export async function listBookings() {
  if (isPg()) {
    const { rows } = await q(
      `select b.*, c.name as customer_name, c.phone as customer_phone
       from bookings b left join customers c on c.id=b.customer_id
       order by b.created_at desc`,
    );
    return rows;
  }
  return getDB().bookings;
}

export async function updateBookingStatus(id, status) {
  if (isPg()) {
    await q('update bookings set status=$2 where id=$1', [id, status]);
    return;
  }
  mutate((db) => {
    const b = db.bookings.find((x) => x.id === id);
    if (b) b.status = status;
  });
}

export async function deleteBooking(id) {
  if (isPg()) {
    await q('delete from bookings where id=$1', [id]);
    return;
  }
  mutate((db) => {
    db.bookings = db.bookings.filter((b) => b.id !== id);
  });
}

// ── Support tickets ───────────────────────────────────────────

export async function createTicket(category, notes, channel = 'web') {
  if (isPg()) {
    const { rows } = await q(
      `insert into support_tickets (category,notes,channel,status) values ($1,$2,$3,'open') returning *`,
      [category, notes, channel],
    );
    return rows[0];
  }
  return mutate((db) => {
    const tk = { id: nextId('tk', db), customer_id: null, booking_id: null, category, channel, status: 'open', sla_due: null, notes, created_at: now() };
    db.tickets.unshift(tk);
    return tk;
  });
}

export async function updateTicketStatus(id, status) {
  if (isPg()) {
    await q('update support_tickets set status=$2 where id=$1', [id, status]);
    return;
  }
  mutate((db) => {
    const tk = db.tickets.find((x) => x.id === id);
    if (tk) tk.status = status;
  });
}

export async function deleteTicket(id) {
  if (isPg()) {
    await q('delete from support_tickets where id=$1', [id]);
    return;
  }
  mutate((db) => {
    db.tickets = db.tickets.filter((t) => t.id !== id);
  });
}

export async function listTickets() {
  if (isPg()) {
    const { rows } = await q('select * from support_tickets order by created_at desc');
    return rows;
  }
  return getDB().tickets;
}

// ── Analytics / metrics ───────────────────────────────────────
// Computed from the canonical lists so the result is identical whether
// the store is Postgres or the JSON file — no store-specific SQL to keep
// in sync, and trivially unit-testable.

const BOOKING_STATUSES = ['lead', 'quoted', 'confirmed', 'fulfilled', 'cancelled'];
const TICKET_STATUSES = ['open', 'in_progress', 'resolved'];
const dayKey = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);

export async function getMetrics({ days = 30 } = {}) {
  const [bookings, vendors, tickets] = await Promise.all([listBookings(), listVendors(), listTickets()]);

  // Booking funnel + money.
  const byStatus = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0]));
  let gmv = 0;
  let commission = 0;
  const revenueByService = {};
  for (const b of bookings) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    const won = b.status === 'confirmed' || b.status === 'fulfilled';
    if (won) {
      const amt = Number(b.amount) || 0;
      gmv += amt;
      commission += Number(b.commission) || Math.round(amt * 0.12);
      revenueByService[b.service_type] = (revenueByService[b.service_type] ?? 0) + amt;
    }
  }
  const totalLeads = bookings.length;
  const wonCount = byStatus.confirmed + byStatus.fulfilled;
  const conversionRate = totalLeads ? Math.round((wonCount / totalLeads) * 1000) / 10 : 0;

  // Leads-per-day timeseries for the last `days` days (zero-filled).
  const today = new Date();
  const series = [];
  const counts = new Map();
  for (const b of bookings) {
    const k = dayKey(b.created_at);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const k = d.toISOString().slice(0, 10);
    series.push({ date: k, leads: counts.get(k) ?? 0 });
  }

  // Vendors.
  const vendorsByKyc = { pending: 0, verified: 0, rejected: 0 };
  let activeVendors = 0;
  for (const v of vendors) {
    vendorsByKyc[v.kyc_status] = (vendorsByKyc[v.kyc_status] ?? 0) + 1;
    if (v.active) activeVendors += 1;
  }

  // Tickets.
  const ticketsByStatus = Object.fromEntries(TICKET_STATUSES.map((s) => [s, 0]));
  for (const t of tickets) ticketsByStatus[t.status] = (ticketsByStatus[t.status] ?? 0) + 1;

  return {
    bookings: {
      total: totalLeads,
      byStatus,
      won: wonCount,
      conversionRate,
      gmv,
      commission,
      avgOrderValue: wonCount ? Math.round(gmv / wonCount) : 0,
    },
    revenueByService,
    series,
    vendors: { total: vendors.length, active: activeVendors, byKyc: vendorsByKyc },
    tickets: { total: tickets.length, byStatus: ticketsByStatus, open: ticketsByStatus.open + ticketsByStatus.in_progress },
  };
}

// ── Admin accounts ────────────────────────────────────────────
// `password_hash` is never returned to clients except via getAdminByEmail,
// which is used only by the login flow on the server.

const PUBLIC_ADMIN_COLS = 'id, name, email, role, active, last_login_at, created_at';
const stripHash = ({ password_hash, ...rest }) => rest;
const ADMIN_PATCH_COLS = ['name', 'role', 'active', 'password_hash', 'last_login_at'];

export async function countAdmins() {
  if (isPg()) return (await q('select count(*)::int as n from admins')).rows[0].n;
  return getDB().admins.length;
}

export async function listAdmins() {
  if (isPg()) {
    const { rows } = await q(`select ${PUBLIC_ADMIN_COLS} from admins order by created_at`);
    return rows;
  }
  return [...getDB().admins].sort((a, b) => (a.created_at < b.created_at ? -1 : 1)).map(stripHash);
}

export async function getAdminByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  if (isPg()) {
    const { rows } = await q('select * from admins where lower(email)=$1', [e]);
    return rows[0] ?? null;
  }
  return getDB().admins.find((a) => a.email.toLowerCase() === e) ?? null;
}

export async function createAdmin(input) {
  const role = input.role === 'owner' ? 'owner' : 'admin';
  const active = input.active ?? true;
  if (isPg()) {
    const { rows } = await q(
      `insert into admins (name,email,password_hash,role,active)
       values ($1,$2,$3,$4,$5) returning ${PUBLIC_ADMIN_COLS}`,
      [input.name, String(input.email).toLowerCase(), input.password_hash, role, active],
    );
    return rows[0];
  }
  return mutate((db) => {
    const a = {
      id: nextId('adm', db), name: input.name, email: String(input.email).toLowerCase(),
      password_hash: input.password_hash, role, active, last_login_at: null, created_at: now(),
    };
    db.admins.unshift(a);
    return stripHash(a);
  });
}

export async function updateAdmin(id, patch) {
  if (isPg()) {
    const keys = Object.keys(patch).filter((k) => ADMIN_PATCH_COLS.includes(k));
    if (!keys.length) return;
    const set = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
    await q(`update admins set ${set} where id=$1`, [id, ...keys.map((k) => patch[k])]);
    return;
  }
  mutate((db) => {
    const a = db.admins.find((x) => x.id === id);
    if (a) for (const k of Object.keys(patch)) if (ADMIN_PATCH_COLS.includes(k)) a[k] = patch[k];
  });
}

export async function deleteAdmin(id) {
  if (isPg()) {
    await q('delete from admins where id=$1', [id]);
    return;
  }
  mutate((db) => { db.admins = db.admins.filter((a) => a.id !== id); });
}

/** Seed the first owner account from env when no admins exist yet. */
export async function ensureOwnerAdmin() {
  if ((await countAdmins()) > 0) return false;
  await createAdmin({
    name: process.env.ADMIN_NAME || 'Owner',
    email: (process.env.ADMIN_EMAIL || 'admin@kumbhconnect.in').toLowerCase(),
    password_hash: hashPassword(process.env.ADMIN_PASSWORD || 'kumbh2027'),
    role: 'owner',
    active: true,
  });
  return true;
}
