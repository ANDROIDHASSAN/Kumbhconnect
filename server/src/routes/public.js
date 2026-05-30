import { Router } from 'express';
import * as data from '../data.js';
import { SERVICE_SLUGS } from '../lib/services.js';
import { createAdvanceOrder } from '../lib/razorpay.js';
import { HELP_DESKS } from '../lib/mock-data.js';

const router = Router();

// Vendors for a service (public listing pages)
router.get('/services/:slug/vendors', async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!SERVICE_SLUGS.includes(slug)) return res.status(404).json({ error: 'Unknown service' });
    const vendors = await data.getVendorsByType(slug);
    res.json({ vendors });
  } catch (e) { next(e); }
});

// A single vendor profile (with inventory) for the vendor detail page
router.get('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await data.getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ vendor });
  } catch (e) { next(e); }
});

// Emergency help desks (static reference data)
router.get('/emergency/desks', (_req, res) => res.json({ desks: HELP_DESKS }));

// Capture a lead from the booking form
router.post('/leads', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!SERVICE_SLUGS.includes(b.service_type)) return res.status(422).json({ error: 'invalid service_type' });
    if (!b.name || !b.phone) return res.status(422).json({ error: 'name and phone are required' });
    const booking = await data.createLead({
      service_type: b.service_type,
      name: String(b.name).slice(0, 120),
      phone: String(b.phone).slice(0, 20),
      language: b.language || 'en',
      party_size: b.party_size ? Number(b.party_size) : undefined,
      start_date: b.start_date || undefined,
      end_date: b.end_date || undefined,
      area: b.area || undefined,
      notes: b.notes || undefined,
      channel: b.channel || 'web',
      vendor_id: b.vendor_id || undefined,
      vendor_name: b.vendor_name || undefined,
    });
    res.status(201).json({ ok: true, booking });
  } catch (e) { next(e); }
});

// Vendor self-signup (goes to admin as pending KYC)
router.post('/vendors', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!SERVICE_SLUGS.includes(b.type)) return res.status(422).json({ error: 'invalid type' });
    if (!b.name || !b.contact_name || !b.phone || !b.area) return res.status(422).json({ error: 'missing fields' });
    const vendor = await data.createVendorSignup({
      type: b.type, name: b.name, area: b.area, capacity: b.capacity ? Number(b.capacity) : undefined,
    });
    res.status(201).json({ ok: true, vendor });
  } catch (e) { next(e); }
});

// Advance payment (Razorpay order or stubbed UPI link)
router.post('/payments', async (req, res, next) => {
  try {
    const { booking_id, amount } = req.body || {};
    if (!booking_id) return res.status(422).json({ error: 'booking_id required' });
    const order = await createAdvanceOrder(Number(amount) || 0, booking_id);
    res.json(order);
  } catch (e) { next(e); }
});

export default router;
