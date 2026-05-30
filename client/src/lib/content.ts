// ─────────────────────────────────────────────────────────────
// Editorial content (FAQ, testimonials, guide). UI chrome is fully
// localised via messages/*.json; this longer-form copy is in English
// and is the natural next thing to translate for full EN/HI/MR coverage.
// ─────────────────────────────────────────────────────────────

export const HOME_FAQ = [
  {
    q: 'Do I need to pay the full amount upfront?',
    a: 'No. You pay a small advance (about 20%) to confirm your booking; the balance is paid on arrival. UPI and cards are supported.',
  },
  {
    q: 'Are the hotels, tents and cabs verified?',
    a: 'Yes. Every vendor goes through KYC verification before they appear in our options. We show transparent, all-inclusive pricing.',
  },
  {
    q: 'Can I get help in Hindi or Marathi?',
    a: 'Absolutely. Our website and WhatsApp support work in English, हिंदी and मराठी. Use the language switcher at the top.',
  },
  {
    q: 'What if I have a problem during my trip?',
    a: 'Tap the WhatsApp button any time to reach a real person. For medical, police or lost-and-found, use the Emergency page for one-tap help with your location shared.',
  },
  {
    q: 'Is there a cancellation or refund policy?',
    a: 'Yes. Most stays include a free cancellation window. Refund terms are shown clearly before you pay and on our Refund Policy page.',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Sunita & family',
    place: 'Pune',
    quote:
      'We travelled with my elderly parents. Kumbh Connect found a clean lodge near the ghat and a senior-friendly cab. WhatsApp help replied within minutes.',
    rating: 5,
  },
  {
    name: 'Rajesh M.',
    place: 'Indore',
    quote:
      'Booked a private tent for snan day. Fair price, no surprises, and the route guidance saved us hours in the crowd.',
    rating: 5,
  },
  {
    name: 'Anita D.',
    place: 'Mumbai',
    quote:
      'I was nervous about the crowds. Having one trusted number on WhatsApp for everything made the whole pilgrimage calm.',
    rating: 5,
  },
];

export interface SnanDate {
  name: string;
  date: string;
  note: string;
}

// Indicative Shahi Snan dates — to be confirmed by the administration.
export const SNAN_DATES: SnanDate[] = [
  { name: 'First Shahi Snan', date: '2027-08-02', note: 'Shravan Amavasya (indicative)' },
  { name: 'Second Shahi Snan', date: '2027-08-31', note: 'Bhadrapad (indicative)' },
  { name: 'Third Shahi Snan', date: '2027-09-11', note: 'Amavasya (indicative)' },
];

export const GHATS = [
  { name: 'Ramkund, Panchavati', desc: 'The principal bathing ghat on the Godavari in Nashik.' },
  { name: 'Kushavarta Kund, Trimbakeshwar', desc: 'Sacred kund and source of the Godavari, near the Jyotirlinga.' },
  { name: 'Tapovan', desc: 'Confluence area with large tent cities and shuttle points.' },
  { name: 'Gangapur', desc: 'Quieter ghats upstream, good for less-crowded darshan.' },
];

export const PACKING = [
  'Light cotton clothes and a change for after the bath',
  'Comfortable walking footwear (lots of walking)',
  'Reusable water bottle and ORS sachets',
  'Basic medicines and any personal prescriptions',
  'Power bank, copy of ID, and some cash for small vendors',
  'A printed/saved map and your booking voucher',
];

export const DOS = [
  'Reach ghats early on snan days to avoid peak crowds',
  'Keep elderly members and children close; agree a meeting point',
  'Follow police and volunteer instructions and barricades',
  'Save the Kumbh Connect WhatsApp number and the 112 helpline',
];

export const DONTS = [
  "Don't carry valuables you can't safeguard in the crowd",
  "Don't rely only on private vehicles near ghats on snan days",
  "Don't ignore feeling unwell — visit the nearest medical camp",
  "Don't pay touts; use verified vendors with transparent pricing",
];

export const GUIDE_FAQ = [
  {
    q: 'When is the Nashik Kumbh 2027?',
    a: 'The Simhastha Kumbh Mela at Nashik and Trimbakeshwar runs through the latter half of 2027, with the main Shahi Snan (royal bath) days drawing the largest crowds. Exact dates are confirmed by the administration; we update this page as they are announced.',
  },
  {
    q: 'How do I reach Nashik and Trimbakeshwar?',
    a: 'Nashik is well connected by train (Nashik Road station), road (NH-160/NH-848) and the nearest major airports. Trimbakeshwar is about 28 km from Nashik city by road, with shuttle services on snan days.',
  },
  {
    q: 'Where should I stay?',
    a: 'Stay near Panchavati/Ramkund for Nashik ghats, or in Trimbakeshwar town for the Jyotirlinga and Kushavarta. Tent cities in Tapovan are closest to the action on snan days.',
  },
  {
    q: 'Is parking available near the ghats?',
    a: 'On snan days, private vehicles are restricted near ghats. Use designated outer-parking zones and shuttle services. Our Parking page shows live availability and shuttle timings.',
  },
];
