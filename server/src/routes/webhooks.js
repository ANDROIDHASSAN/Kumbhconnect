import { Router } from 'express';
import * as data from '../data.js';
import { getWhatsAppGateway, detectIntent, detectLanguage } from '../lib/whatsapp.js';
import { verifyWebhookSignature } from '../lib/razorpay.js';
import { getPool, isPg } from '../db.js';

const router = Router();

// WhatsApp Cloud API verification handshake
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_API_TOKEN) {
    return res.status(200).send(challenge || '');
  }
  res.status(403).send('Forbidden');
});

// Inbound WhatsApp message → intent detection → capture lead/ticket → reply
router.post('/whatsapp', async (req, res) => {
  try {
    const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = msg?.from;
    const text = msg?.text?.body;
    if (from && text) {
      const intent = detectIntent(text);
      const language = detectLanguage(text);
      if (intent === 'emergency') {
        await data.createTicket('emergency', `WhatsApp: ${text}`, 'whatsapp');
      } else {
        await data.createLead({ service_type: intent, name: `WhatsApp ${from}`, phone: from, language, notes: text, channel: 'whatsapp' });
      }
      const gateway = getWhatsAppGateway();
      if (gateway) {
        await gateway.sendText(from, 'Namaste! We received your request and our team is matching verified options. 🙏');
      }
    }
  } catch (e) {
    console.error('whatsapp webhook error', e);
  }
  res.json({ ok: true });
});

// Razorpay webhook — verify signature, record payment + confirm booking
router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] || '';
  const raw = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
  if (!verifyWebhookSignature(raw, signature)) {
    return res.status(400).json({ ok: false, reason: 'unverified' });
  }
  const payment = req.body?.payload?.payment?.entity;
  const bookingId = payment?.notes?.bookingId;
  if (isPg() && bookingId && req.body?.event === 'payment.captured') {
    await getPool().query(
      `insert into payments (booking_id,kind,amount,status,provider_ref) values ($1,'advance',$2,'paid',$3)`,
      [bookingId, (payment.amount ?? 0) / 100, payment.id],
    );
    await getPool().query('update bookings set status=$2 where id=$1', [bookingId, 'confirmed']);
  }
  res.json({ ok: true });
});

export default router;
