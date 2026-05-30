import { Router } from 'express';
import * as data from '../data.js';
import { isPg } from '../db.js';
import { SERVICE_SLUGS } from '../lib/services.js';
import { issueToken, verifyToken, hashPassword, verifyPasswordHash, checkRateLimit, recordFailure, recordSuccess } from '../lib/auth.js';
import { cloudinaryConfig, signUpload } from '../lib/cloudinary.js';

const router = Router();

const clientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifyToken(token);
  if (payload) {
    req.admin = payload; // { sub, email, role, name, iat, exp }
    return next();
  }
  res.status(401).json({ error: 'Unauthorised' });
}

// Login → email + password against the admins table. Rate-limited per IP and
// verified in constant time. Returns a signed, identity-carrying token.
router.post('/login', async (req, res, next) => {
  try {
    const ip = clientIp(req);
    const { limited, retryAfterMs } = checkRateLimit(ip);
    if (limited) {
      res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
      return res.status(429).json({ ok: false, error: 'Too many attempts. Try again later.', retryAfterMs });
    }
    const { email, password } = req.body || {};
    const admin = await data.getAdminByEmail(email);
    const ok = admin && admin.active && verifyPasswordHash(password, admin.password_hash);
    if (!ok) {
      recordFailure(ip);
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    recordSuccess(ip);
    await data.updateAdmin(admin.id, { last_login_at: new Date().toISOString() });
    const identity = { sub: admin.id, email: admin.email, role: admin.role, name: admin.name };
    res.json({ ok: true, token: issueToken(identity), admin: identity });
  } catch (e) { next(e); }
});

// Lightweight token validity check (lets the client re-auth on load).
router.get('/session', requireAdmin, (_req, res) => res.json({ ok: true }));

// Who am I — the currently authenticated admin (from the token).
router.get('/me', requireAdmin, (req, res) =>
  res.json({ admin: { id: req.admin.sub, name: req.admin.name, email: req.admin.email, role: req.admin.role } }));

// ── Admin account management ──
router.get('/admins', requireAdmin, async (_req, res, next) => {
  try { res.json({ admins: await data.listAdmins() }); } catch (e) { next(e); }
});

router.post('/admins', requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(422).json({ error: 'Name, email and password are required.' });
    if (!EMAIL_RE.test(String(email))) return res.status(422).json({ error: 'Enter a valid email address.' });
    if (String(password).length < 6) return res.status(422).json({ error: 'Password must be at least 6 characters.' });
    if (await data.getAdminByEmail(email)) return res.status(409).json({ error: 'An admin with this email already exists.' });
    // Only an owner can create another owner.
    const wantRole = role === 'owner' && req.admin.role === 'owner' ? 'owner' : 'admin';
    const admin = await data.createAdmin({ name: String(name).slice(0, 120), email, password_hash: hashPassword(password), role: wantRole, active: true });
    res.status(201).json({ admin });
  } catch (e) { next(e); }
});

router.patch('/admins/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const patch = {};
    if (typeof body.active === 'boolean') {
      if (id === req.admin.sub && body.active === false) return res.status(400).json({ error: "You can't disable your own account." });
      patch.active = body.active;
    }
    if (body.password) {
      if (String(body.password).length < 6) return res.status(422).json({ error: 'Password must be at least 6 characters.' });
      patch.password_hash = hashPassword(body.password);
    }
    if (body.role && req.admin.role === 'owner') patch.role = body.role === 'owner' ? 'owner' : 'admin';
    if (!Object.keys(patch).length) return res.status(422).json({ error: 'Nothing to update.' });
    if (patch.active === false && (await data.listAdmins()).filter((a) => a.active).length <= 1) {
      return res.status(400).json({ error: "Can't disable the last active admin." });
    }
    await data.updateAdmin(id, patch);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/admins/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.admin.sub) return res.status(400).json({ error: "You can't delete your own account." });
    const admins = await data.listAdmins();
    const target = admins.find((a) => a.id === id);
    if (!target) return res.status(404).json({ error: 'Admin not found.' });
    if (target.role === 'owner' && req.admin.role !== 'owner') return res.status(403).json({ error: 'Only an owner can remove an owner.' });
    if (admins.length <= 1) return res.status(400).json({ error: "Can't delete the last admin." });
    await data.deleteAdmin(id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Image uploads — mint a short-lived Cloudinary signature so the browser can
// upload directly. 503 when not configured (UI then falls back to a URL field).
router.post('/uploads/sign', requireAdmin, (_req, res) => {
  const cfg = cloudinaryConfig();
  if (!cfg) return res.status(503).json({ error: 'Image uploads are not configured. Set CLOUDINARY_* env vars, or paste an image URL.' });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'kumbhconnect/vendors';
  const signature = signUpload({ folder, timestamp }, cfg.apiSecret);
  res.json({ cloudName: cfg.cloudName, apiKey: cfg.apiKey, timestamp, folder, signature });
});

// Dashboard data
router.get('/data', requireAdmin, async (_req, res, next) => {
  try {
    const [bookings, vendors, tickets] = await Promise.all([
      data.listBookings(), data.listVendors(), data.listTickets(),
    ]);
    res.json({ bookings, vendors, tickets, usingPg: isPg() });
  } catch (e) { next(e); }
});

// Aggregated metrics for the overview dashboard
router.get('/metrics', requireAdmin, async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);
    res.json(await data.getMetrics({ days }));
  } catch (e) { next(e); }
});

// Vendors
router.post('/vendors', requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!SERVICE_SLUGS.includes(b.type) || !b.name || !b.area) return res.status(422).json({ error: 'invalid vendor' });
    const vendor = await data.adminCreateVendor(b);
    res.status(201).json({ vendor });
  } catch (e) { next(e); }
});
router.patch('/vendors/:id', requireAdmin, async (req, res, next) => {
  try { await data.updateVendor(req.params.id, req.body || {}); res.json({ ok: true }); } catch (e) { next(e); }
});
router.post('/vendors/:id/verify', requireAdmin, async (req, res, next) => {
  try { await data.updateVendor(req.params.id, { kyc_status: 'verified', active: true }); res.json({ ok: true }); } catch (e) { next(e); }
});
router.delete('/vendors/:id', requireAdmin, async (req, res, next) => {
  try { await data.deleteVendor(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

// Bookings
router.post('/bookings', requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!SERVICE_SLUGS.includes(b.service_type) || !b.name || !b.phone) return res.status(422).json({ error: 'invalid booking' });
    const booking = await data.adminCreateBooking(b);
    res.status(201).json({ booking });
  } catch (e) { next(e); }
});
router.patch('/bookings/:id', requireAdmin, async (req, res, next) => {
  try { await data.updateBookingStatus(req.params.id, (req.body || {}).status); res.json({ ok: true }); } catch (e) { next(e); }
});
router.delete('/bookings/:id', requireAdmin, async (req, res, next) => {
  try { await data.deleteBooking(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

// Tickets
router.post('/tickets', requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.category) return res.status(422).json({ error: 'category required' });
    const ticket = await data.createTicket(b.category, b.notes || '', b.channel || 'phone');
    res.status(201).json({ ticket });
  } catch (e) { next(e); }
});
router.patch('/tickets/:id', requireAdmin, async (req, res, next) => {
  try { await data.updateTicketStatus(req.params.id, (req.body || {}).status); res.json({ ok: true }); } catch (e) { next(e); }
});
router.delete('/tickets/:id', requireAdmin, async (req, res, next) => {
  try { await data.deleteTicket(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

export default router;
