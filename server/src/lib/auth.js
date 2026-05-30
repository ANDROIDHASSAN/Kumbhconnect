// ─────────────────────────────────────────────────────────────
// Admin authentication: constant-time password check, expiring
// HMAC-signed bearer tokens, and an in-memory login rate limiter.
//
// The token is stateless and self-verifying — no server-side session
// store needed. It carries an issued-at + expiry and is signed with an
// HMAC secret, so it cannot be forged or replayed past its TTL.
// ─────────────────────────────────────────────────────────────
import crypto from 'node:crypto';

const TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS) || 12 * 60 * 60 * 1000; // 12h

export const adminPassword = () => process.env.ADMIN_PASSWORD || 'kumbh2027';

// Signing secret. Prefer an explicit ADMIN_SECRET; otherwise derive a stable
// one from the password so tokens are still unforgeable without it.
const signingSecret = () => process.env.ADMIN_SECRET || `kc-token-secret|${adminPassword()}`;

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => crypto.createHmac('sha256', signingSecret()).update(data).digest('base64url');

/** Constant-time string comparison that does not leak length via early exit. */
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const checkPassword = (candidate) => safeEqual(candidate ?? '', adminPassword());

// ── Password hashing (scrypt, Node built-in — no dependency) ──
// Stored as `scrypt$<salt>$<hash>`. Verification is constant-time.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPasswordHash(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored).split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = crypto.scryptSync(String(password), salt, 64);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Issue a signed token valid for TOKEN_TTL_MS. `subject` carries the admin
 * identity (id, email, role, name) so requests can be attributed and authorised.
 */
export function issueToken(subject = {}, now = Date.now()) {
  const payload = { ...subject, iat: now, exp: now + TOKEN_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${hmac(body)}`;
}

/** Verify a bearer token's signature and expiry. Returns the payload or null. */
export function verifyToken(token, now = Date.now()) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  // Compare as fixed-length buffers to keep the check constant-time.
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Login rate limiter (per-IP, in-memory, fixed window with lockout) ──
const MAX_ATTEMPTS = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS) || 8;
const WINDOW_MS = Number(process.env.ADMIN_LOGIN_WINDOW_MS) || 15 * 60 * 1000; // 15m
const attempts = new Map(); // ip → { count, resetAt }

/** Returns { limited, retryAfterMs }. Call before checking the password. */
export function checkRateLimit(ip, now = Date.now()) {
  const rec = attempts.get(ip);
  if (rec && rec.resetAt > now && rec.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterMs: rec.resetAt - now };
  }
  return { limited: false, retryAfterMs: 0 };
}

/** Record a failed login attempt and (re)start the window if needed. */
export function recordFailure(ip, now = Date.now()) {
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

/** Clear a successful login's attempt counter. */
export function recordSuccess(ip) {
  attempts.delete(ip);
}

/** Test helper: wipe rate-limit state. */
export function __resetRateLimit() {
  attempts.clear();
}

export const config = { TOKEN_TTL_MS, MAX_ATTEMPTS, WINDOW_MS };
