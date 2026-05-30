// Rate-limit tests — isolated in their own file so the low attempt cap set
// here (read once at module load) doesn't affect the other suites.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_PASSWORD = 'rl-pass';
process.env.ADMIN_SECRET = 'rl-secret';
process.env.ADMIN_LOGIN_MAX_ATTEMPTS = '3';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kc-rl-'));
delete process.env.DATABASE_URL;

const { createApp } = await import('../src/app.js');

let base;
let server;

before(async () => {
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

const tryLogin = (password) =>
  fetch(`${base}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rl@test.in', password }),
  });

test('locks out after too many failed attempts', async () => {
  // 3 allowed failures (MAX_ATTEMPTS=3), then the 4th is rate-limited.
  for (let i = 0; i < 3; i++) {
    assert.equal((await tryLogin('wrong')).status, 401);
  }
  const blocked = await tryLogin('wrong');
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('retry-after'));

  // Even the correct password is blocked while locked out.
  assert.equal((await tryLogin('rl-pass')).status, 429);
});
