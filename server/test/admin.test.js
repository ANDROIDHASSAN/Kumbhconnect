// Admin API tests — run with `npm test` (node:test, no extra deps).
// Each test file runs in its own process, so env set here is isolated.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_EMAIL = 'owner@test.in';
process.env.ADMIN_NAME = 'Test Owner';
process.env.ADMIN_PASSWORD = 'test-secret-pw';
process.env.ADMIN_SECRET = 'unit-test-secret';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kc-test-'));
delete process.env.DATABASE_URL; // force the JSON file store

const { createApp } = await import('../src/app.js');
const { issueToken } = await import('../src/lib/auth.js');
const { ensureOwnerAdmin } = await import('../src/data.js');

let base;
let server;

before(async () => {
  await ensureOwnerAdmin(); // seed the owner account into the file store
  const app = createApp();
  server = await new Promise((res) => {
    const s = app.listen(0, () => res(s));
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
});

const api = (path, opts = {}) =>
  fetch(`${base}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });

async function login(email = 'owner@test.in', password = 'test-secret-pw') {
  return api('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

const authed = (token) => ({ Authorization: `Bearer ${token}` });

test('rejects the wrong password with 401', async () => {
  const res = await login('owner@test.in', 'nope');
  assert.equal(res.status, 401);
  assert.equal((await res.json()).ok, false);
});

test('rejects an unknown email with 401', async () => {
  assert.equal((await login('ghost@test.in', 'test-secret-pw')).status, 401);
});

test('accepts the correct credentials and returns a token + identity', async () => {
  const res = await login();
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.match(body.token, /^[\w-]+\.[\w-]+$/);
  assert.equal(body.admin.email, 'owner@test.in');
  assert.equal(body.admin.role, 'owner');
});

test('protected routes require a valid token', async () => {
  assert.equal((await api('/admin/data')).status, 401);
  assert.equal((await api('/admin/data', { headers: authed('garbage.token') })).status, 401);
  const { token } = await (await login()).json();
  assert.equal((await api('/admin/data', { headers: authed(token) })).status, 200);
});

test('rejects an expired token', async () => {
  // Mint a token that expired one second ago.
  const ttl = Number(process.env.ADMIN_TOKEN_TTL_MS) || 12 * 60 * 60 * 1000;
  const expired = issueToken({ sub: 'x' }, Date.now() - ttl - 1000);
  assert.equal((await api('/admin/data', { headers: authed(expired) })).status, 401);
});

test('session endpoint validates the token', async () => {
  const { token } = await (await login()).json();
  assert.equal((await api('/admin/session', { headers: authed(token) })).status, 200);
});

test('full booking lifecycle: create → patch status → delete', async () => {
  const { token } = await (await login()).json();
  const h = authed(token);

  const created = await api('/admin/bookings', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ service_type: 'rooms', name: 'Test Pilgrim', phone: '9990001111', party_size: 2, amount: 2400, status: 'lead' }),
  });
  assert.equal(created.status, 201);
  const { booking } = await created.json();
  assert.ok(booking.id);

  const patched = await api(`/admin/bookings/${booking.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'confirmed' }) });
  assert.equal(patched.status, 200);

  const list = await (await api('/admin/data', { headers: h })).json();
  assert.equal(list.bookings.find((b) => b.id === booking.id).status, 'confirmed');

  const del = await api(`/admin/bookings/${booking.id}`, { method: 'DELETE', headers: h });
  assert.equal(del.status, 200);

  const after = await (await api('/admin/data', { headers: h })).json();
  assert.equal(after.bookings.find((b) => b.id === booking.id), undefined);
});

test('rejects invalid booking payloads with 422', async () => {
  const { token } = await (await login()).json();
  const res = await api('/admin/bookings', { method: 'POST', headers: authed(token), body: JSON.stringify({ service_type: 'rooms' }) });
  assert.equal(res.status, 422);
});

test('metrics reflects a confirmed booking in GMV and conversion', async () => {
  const { token } = await (await login()).json();
  const h = authed(token);

  const before = await (await api('/admin/metrics', { headers: h })).json();

  const { booking } = await (await api('/admin/bookings', {
    method: 'POST', headers: h,
    body: JSON.stringify({ service_type: 'rooms', name: 'GMV Test', phone: '9000000001', amount: 5000, status: 'confirmed' }),
  })).json();

  const after = await (await api('/admin/metrics', { headers: h })).json();
  assert.equal(after.bookings.total, before.bookings.total + 1);
  assert.equal(after.bookings.won, before.bookings.won + 1);
  assert.equal(after.bookings.gmv, before.bookings.gmv + 5000);
  assert.ok(after.bookings.commission > before.bookings.commission);
  assert.equal(after.series.length, 30);
  assert.ok(after.revenueByService.rooms >= 5000);

  await api(`/admin/bookings/${booking.id}`, { method: 'DELETE', headers: h });
});

test('metrics has the expected shape', async () => {
  const { token } = await (await login()).json();
  const m = await (await api('/admin/metrics', { headers: authed(token) })).json();
  for (const key of ['bookings', 'revenueByService', 'series', 'vendors', 'tickets']) {
    assert.ok(key in m, `missing ${key}`);
  }
  assert.ok('conversionRate' in m.bookings);
  assert.ok(Array.isArray(m.series));
});

// ── Admin account management ──

test('/me returns the authenticated admin', async () => {
  const { token } = await (await login()).json();
  const { admin } = await (await api('/admin/me', { headers: authed(token) })).json();
  assert.equal(admin.email, 'owner@test.in');
  assert.equal(admin.role, 'owner');
});

test('lists admins without exposing password hashes', async () => {
  const { token } = await (await login()).json();
  const { admins } = await (await api('/admin/admins', { headers: authed(token) })).json();
  const owner = admins.find((a) => a.email === 'owner@test.in');
  assert.ok(owner && owner.role === 'owner');
  assert.ok(!('password_hash' in owner), 'password_hash must not leak');
});

test('creates a new admin who can then log in', async () => {
  const { token } = await (await login()).json();
  const h = authed(token);
  const res = await api('/admin/admins', { method: 'POST', headers: h, body: JSON.stringify({ name: 'Priya', email: 'priya@test.in', password: 'secret123' }) });
  assert.equal(res.status, 201);
  const { admin } = await res.json();
  assert.equal(admin.role, 'admin'); // non-owner role by default
  assert.equal((await login('priya@test.in', 'secret123')).status, 200);
});

test('rejects duplicate email (409) and weak password (422)', async () => {
  const { token } = await (await login()).json();
  const h = authed(token);
  assert.equal((await api('/admin/admins', { method: 'POST', headers: h, body: JSON.stringify({ name: 'Dup', email: 'priya@test.in', password: 'secret123' }) })).status, 409);
  assert.equal((await api('/admin/admins', { method: 'POST', headers: h, body: JSON.stringify({ name: 'Weak', email: 'weak@test.in', password: '123' }) })).status, 422);
});

test("can't delete your own account", async () => {
  const body = await (await login()).json();
  const res = await api(`/admin/admins/${body.admin.sub}`, { method: 'DELETE', headers: authed(body.token) });
  assert.equal(res.status, 400);
});

test('can disable an admin (who then cannot log in) and delete them', async () => {
  const { token } = await (await login()).json();
  const h = authed(token);
  const { admin } = await (await api('/admin/admins', { method: 'POST', headers: h, body: JSON.stringify({ name: 'Temp', email: 'temp@test.in', password: 'secret123' }) })).json();

  assert.equal((await api(`/admin/admins/${admin.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ active: false }) })).status, 200);
  assert.equal((await login('temp@test.in', 'secret123')).status, 401); // disabled → blocked
  assert.equal((await api(`/admin/admins/${admin.id}`, { method: 'DELETE', headers: h })).status, 200);
});
