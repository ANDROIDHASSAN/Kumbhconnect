# Kumbh Connect — Master Build Prompt

This document gives you a single, comprehensive prompt to hand to an AI coding tool to build the
**Kumbh Connect** platform, plus a recommended build order and follow-up prompts for each phase.

---

## How to use this

- **Best for:** Claude Code, Cursor, Lovable, Bolt.new, or v0. For agentic CLI tools (Claude Code) paste
  the whole "MASTER PROMPT" block as your first message. For UI builders (Lovable/Bolt/v0), paste the
  master prompt, then drive each phase with the "PHASE PROMPTS" below.
- **Build incrementally.** Don't try to generate the entire platform in one shot. Start with Phase 0
  (the marketing + lead-capture site), confirm it runs, then move phase by phase.
- **Fill the placeholders.** Anywhere you see `<<...>>`, replace with your real values (WhatsApp number,
  brand domain, API keys). Keep secrets in `.env`, never in code.
- **You do not need real API keys to start.** Phases 0–1 run with mock data and click-to-chat WhatsApp
  links. Real WhatsApp Cloud API, payments and maps come in later phases.

---

## ✅ MASTER PROMPT — paste this block

````
You are a senior full-stack engineer and product designer. Build a production-quality web platform
called "Kumbh Connect" — a mobile-first digital help & booking service for visitors to the
Nashik–Trimbakeshwar Simhastha Kumbh Mela 2027 (a once-in-12-years Hindu pilgrimage; projected
~10–12 crore visitors). The brand tagline is: "One Trusted Digital Partner for Kumbh Visitors."

GOAL
Help out-of-town pilgrims, families, elderly travellers and tourists book stays and transport, order
food, navigate the event and get emergency help — with a live WhatsApp support layer tying it all
together. Income comes from commissions on rooms/tents/cabs, margin on food, and paid vendor
promotions. The team is 2–3 people with a tiny budget, so the stack must be low-cost, start almost
no-code, and scale without re-architecting.

WORKING METHOD (important)
- Build in the phases defined under "BUILD PHASES". Complete and verify each phase before the next.
- Produce a single runnable repository with a clear README (setup, env vars, run, deploy).
- Use mock/seed data and placeholder env vars so the app runs locally with zero external accounts.
- Before any destructive change or large refactor, briefly explain the plan. Keep components small.
- After each phase, list what was built, how to run it, and what's stubbed vs. real.

TECH STACK (use exactly this unless I say otherwise)
- Framework: Next.js (App Router) + TypeScript + React Server Components where sensible.
- Styling: Tailwind CSS. No heavy UI kit; small, custom, accessible components. Mobile-first.
- Database/Auth/Storage: Supabase (Postgres). Use the free tier. Provide SQL migrations + seed script.
- Payments: Razorpay (UPI + cards) with UPI deep links as fallback. Stub the keys in Phase 1; wire real
  flow in Phase 2. Collect an advance + balance model.
- Messaging: Phase 0–1 use WhatsApp "click-to-chat" links (https://wa.me/<<NUMBER>>?text=...) with a
  prefilled, context-aware message. Phase 3 integrates the WhatsApp Cloud API (via a provider such as
  Interakt/Gupshup/Wati) behind an abstraction so the click-to-chat fallback still works.
- Maps: Google Maps Platform (Maps JS, Places, Directions). Stub with static map images until a key is added.
- Internationalisation: support English, Hindi (हिंदी) and Marathi (मराठी) via next-intl (or equivalent).
  Default to a language switcher; keep all strings in locale files.
- Analytics: GA4 + Meta Pixel, loaded only after consent.
- Deploy target: Vercel (frontend) + Supabase (backend). Document the deploy steps.

DESIGN SYSTEM (match this brand exactly)
- Mood: warm, trustworthy, devotional-modern. Calm, uncluttered, generous spacing. Never cramped.
- Fonts: headings = "Plus Jakarta Sans" (700/800); body = "Inter"; optional display = "Fraunces" for
  large hero/section numerals. Load via next/font.
- Color tokens (CSS variables):
  --ink:#241B2E; --muted:#6E6580; --cream:#FCF8F1; --line:#E8DFCF;
  --saffron:#E2701A; --saffron-dark:#B9530E; --gold:#D8A12B;
  --plum:#3B2B57; --plum-light:#5B4684; --teal:#117C73; --rose:#C0436A.
- Primary action color = saffron; trust/secondary = teal/plum. WhatsApp CTA uses WhatsApp green
  (#25D366) so it's instantly recognizable.
- Rounded cards (12–14px radius), soft borders (--line), cream section backgrounds, subtle shadows.
- Every interactive element has hover/focus/disabled states and is keyboard-accessible (WCAG 2.1 AA).
- Provide a small reusable component set: Button, Card, ServiceTile, Section, StatTile, WhatsAppButton,
  LanguageSwitcher, FormField, Badge/Pill, Modal, EmptyState, Toast.

INFORMATION ARCHITECTURE (pages)
- / (Home): hero + WhatsApp CTA, 7 service tiles, trust band (verified vendors · secure UPI · live help
  · 2015 experience · ratings), how-it-works (3 steps), testimonials, FAQ.
- /services and a page per service: /services/rooms, /tents, /cabs, /food, /routes, /emergency, /parking.
  Each: what's included, indicative pricing range, sample options, and a booking form/CTA.
- /kumbh-guide: SEO magnet — Snan dates, ghat maps, packing list, do's & don'ts, transport, safety.
  Build this for search: clean headings, schema.org Event/FAQ markup, internal links.
- /how-it-works, /book (service picker → details → WhatsApp/pay handoff),
- /vendors (value prop, commission terms, signup form), /about, /safety, /contact.
- A simple /admin area (auth-gated) to view leads/bookings, vendors and support tickets.

CORE MODULES (build as features, each independently usable but cross-selling the others)
1. Room booking — hotels/lodges/homestays near ghats. Commission 10–15%.
2. Tent booking — sadhugram/private tent-city stays. Commission 10–15%.
3. Cab/auto booking — rides to ghats/stations/parking. Commission 12–18%.
4. Food delivery — sattvic meals/thalis/prasad packs. Margin 15–20%. (Phase 3)
5. Route guidance — Snan-day routing, ghat maps, closures, e-shuttle points (Google Directions).
6. Emergency help — one-tap routing to medical/police/lost-&-found with auto-shared location.
7. Parking information — outer-parking availability + shuttle timings. (Phase 3)
Plus: Live WhatsApp support — the connective layer; every flow can escalate to a human in one tap.

DATA MODEL (Supabase / Postgres tables, with RLS)
- customers(id, name, phone, language, party_size, segment, created_at)
- vendors(id, type, name, area, lat, lng, rates_json, capacity, kyc_status, rating, active, created_at)
- inventory(id, vendor_id, service_type, date, units_total, units_available, price)
- bookings(id, customer_id, vendor_id, service_type, status, start_date, end_date, party_size,
  amount, commission, channel, created_at)  -- status: lead|quoted|confirmed|fulfilled|cancelled
- payments(id, booking_id, kind, amount, status, provider_ref, created_at)  -- kind: advance|balance|payout|refund
- support_tickets(id, customer_id, booking_id, category, channel, status, sla_due, notes, created_at)
- promotions(id, vendor_id, tier, starts_at, ends_at, amount)
Provide migrations + a seed script with ~realistic Nashik/Trimbakeshwar sample vendors and inventory.

KEY USER FLOWS (implement end-to-end)
A) Booking: discover → tap WhatsApp or open /book → pick service → enter dates/party/location →
   see vetted, priced options → confirm → pay advance (Razorpay/UPI) → receive WhatsApp voucher →
   human help available until checkout. (Phase 0: stop at "send to WhatsApp with prefilled details" +
   store the lead. Phase 1+: add the real options + payment.)
B) Emergency: open Emergency → pick category (medical/police/lost) → auto-share GPS → route to nearest
   desk/hospital → one-tap call + live agent → follow-up "are you safe" check.
C) Vendor onboarding: outreach → /vendors signup → KYC fields + doc upload → admin verifies →
   list inventory (rates & slots) → go live in options → fulfil bookings → weekly payout record.

NON-FUNCTIONAL REQUIREMENTS
- Mobile-first; Lighthouse performance/SEO/accessibility 90+ on home and guide pages.
- SEO: per-page titles/meta/OG, sitemap.xml, robots.txt, schema.org (LocalBusiness, Event, FAQPage,
  BreadcrumbList). Target intent queries like "Nashik Kumbh 2027 booking / hotels / dates / parking".
- Trust & safety: visible verification badges, transparent pricing, clear refund policy, secure payments.
- Privacy: India DPDP-Act-aware consent for analytics/marketing; store minimal PII; document data handling.
- Robust empty/loading/error states everywhere; forms validated; graceful fallback if a key is missing.
- All copy available in EN/HI/MR; WhatsApp prefilled messages localised too.

DELIVERABLE
A clean, well-structured, runnable repo with: README, .env.example, Tailwind config with the tokens
above, locale files, Supabase migrations + seed, the pages and modules per the phase you're on, the
reusable component set, and notes on what is real vs. stubbed. Optimise for a small team to operate it.

Start with PHASE 0 now. Scaffold the project, set up Tailwind + fonts + tokens, build the Home page,
the 7 service tiles, the Kumbh Guide SEO page, the /book lead form that stores a lead and opens a
prefilled WhatsApp chat, basic i18n, SEO meta + schema, and a minimal /admin list of captured leads.
Then summarise and wait for me to approve Phase 1.
````

---

## 🧱 BUILD PHASES (give these one at a time after the master prompt)

**Phase 0 — Marketing + lead capture (MVP, week 1–2).** Already requested at the end of the master
prompt. Goal: a fast, beautiful, SEO-ready site that converts traffic into WhatsApp conversations and
stored leads. No payments, no automation yet. *This alone is launchable.*

**Phase 1 — Booking engine + vendor data (week 3–4).**
> Proceed to Phase 1. Add Supabase with the data model and RLS, migrations and seed data. Build real
> service-listing pages that read vendors/inventory from the DB, a multi-step booking form that creates
> a `lead`/`quoted` booking, and a Razorpay advance-payment step (use test keys; gracefully stub if
> absent). Build the /admin dashboard to view and update bookings, vendors and tickets. Keep the
> WhatsApp click-to-chat handoff working alongside the new flow.

**Phase 2 — Payments, vendor portal & emergency/maps (week 5–7).**
> Proceed to Phase 2. Finalise the Razorpay advance+balance flow with webhooks and a payments ledger.
> Build the vendor onboarding flow with KYC fields, doc upload to Supabase Storage, admin verification,
> and inventory management for vendors. Implement the Emergency flow with geolocation, nearest-desk
> routing via Google Directions, and one-tap call. Add Google Maps to route-guidance pages.

**Phase 3 — WhatsApp automation, food, parking, promotions (week 8+).**
> Proceed to Phase 3. Integrate the WhatsApp Cloud API behind an interface (keep click-to-chat as
> fallback): inbound message → language/intent detection → structured capture → vendor match → confirm
> + UPI link → voucher → escalate-to-human. Add the Food delivery and Parking modules, vendor paid
> promotions/featured listings, ratings/reviews, GA4/Pixel dashboards, and finalise EN/HI/MR coverage.

---

## 🔑 What you'll need accounts for (and when)

| When | Service | Why |
|------|---------|-----|
| Phase 0 | A WhatsApp number, a domain, Vercel (free) | Click-to-chat + hosting |
| Phase 1 | Supabase (free), Razorpay (test mode) | Bookings DB + payments |
| Phase 2 | Razorpay (live), Google Maps Platform key | Real payments + maps/routing |
| Phase 3 | WhatsApp Cloud API (Meta) via Interakt/Gupshup/Wati, GA4, Meta Pixel | Automation + analytics |

---

## ⚙️ Tips for a great result

- If a tool struggles with the whole block, paste the **MASTER PROMPT** header + TECH STACK + DESIGN
  SYSTEM + IA first to scaffold, then add modules/flows in follow-ups.
- Ask the tool to **show the file tree and run instructions** after each phase so you can verify it runs.
- Keep a `CONTEXT.md` in the repo with this spec so any AI session can re-load the full picture.
- Always tell it: *"keep WhatsApp click-to-chat working as a fallback"* — it's your zero-cost safety net.
- Replace every `<<placeholder>>` and never commit `.env`.
