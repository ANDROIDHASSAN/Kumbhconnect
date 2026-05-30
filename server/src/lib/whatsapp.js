// WhatsApp Cloud API gateway (Phase 3). Null when no provider configured —
// callers fall back to client-side click-to-chat links.

export function getWhatsAppGateway() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return null;
  return {
    async sendText(to, body) {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
        });
        const json = await res.json();
        return { ok: res.ok, id: json?.messages?.[0]?.id };
      } catch {
        return { ok: false };
      }
    },
  };
}

const INTENT_KEYWORDS = {
  rooms: ['room', 'hotel', 'lodge', 'stay'],
  tents: ['tent', 'sadhugram', 'tambu'],
  cabs: ['cab', 'auto', 'taxi', 'ride'],
  food: ['food', 'thali', 'meal', 'prasad'],
  routes: ['route', 'map', 'ghat', 'direction'],
  emergency: ['help', 'emergency', 'medical', 'police', 'lost'],
  parking: ['parking', 'park'],
};

export function detectIntent(text) {
  const lower = (text || '').toLowerCase();
  for (const [svc, words] of Object.entries(INTENT_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return svc;
  }
  return 'rooms';
}

export function detectLanguage(text) {
  return /[ऀ-ॿ]/.test(text || '') ? 'hi' : 'en';
}
