// Cloudinary signed-upload helper (Phase 3). Like Razorpay/WhatsApp, this is
// gracefully stubbed: with no CLOUDINARY_* env vars the upload endpoint returns
// 503 and the admin UI falls back to pasting an image URL. When configured, the
// browser uploads directly to Cloudinary using a short-lived signature minted
// here — the API secret never leaves the server and image bytes never touch it.
import crypto from 'node:crypto';

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  return null;
}

/**
 * Cloudinary signature: SHA-1 of the upload params (sorted, `k=v` joined by `&`)
 * with the API secret appended. The browser must send exactly these params.
 */
export function signUpload(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}
