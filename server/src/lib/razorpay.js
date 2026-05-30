import crypto from 'node:crypto';
import { ADVANCE_PERCENT } from './services.js';

export const isRazorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export function advanceAmount(total) {
  return Math.round((total * ADVANCE_PERCENT) / 100);
}

/** Create an advance order; stubs to a UPI deep link when keys are absent. */
export async function createAdvanceOrder(total, bookingId) {
  const amount = advanceAmount(total);
  const upiLink = `upi://pay?pa=kumbhconnect@upi&pn=Kumbh%20Connect&am=${amount}&cu=INR&tn=${encodeURIComponent('Advance ' + bookingId)}`;

  if (!isRazorpayConfigured) {
    return { ok: true, stubbed: true, amount, currency: 'INR', upiLink };
  }
  try {
    const { default: Razorpay } = await import('razorpay');
    const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await rzp.orders.create({ amount: amount * 100, currency: 'INR', receipt: bookingId, notes: { bookingId } });
    return { ok: true, stubbed: false, orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, upiLink };
  } catch {
    return { ok: true, stubbed: true, amount, currency: 'INR', upiLink };
  }
}

export function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}
