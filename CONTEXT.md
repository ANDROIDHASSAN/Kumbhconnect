# Kumbh Connect — Product Context (PERN)

Re-load this into any session to restore the full picture.

## Product
Mobile-first help & booking platform for the **Nashik–Trimbakeshwar Simhastha Kumbh Mela 2027**
(~10–12 crore visitors). Tagline: *"One Trusted Digital Partner for Kumbh Visitors."* Helps
out-of-town pilgrims, families and elderly travellers book stays/transport, order food,
navigate, and get emergency help — with a live WhatsApp layer over everything. Revenue:
commissions on rooms/tents/cabs, margin on food, paid vendor promotions.

## Stack — PERN (no Next.js)
- **client/** — React 19 + Vite 6 + React Router 6 + Tailwind 3. i18n EN/HI/MR via a small
  React context. Talks to the API via `src/lib/api.ts` (Vite proxies `/api → :4000` in dev).
- **server/** — Node + Express 4 + `pg`. REST API. Postgres when `DATABASE_URL` is set, else a
  JSON file store (`server/.data/store.json`). Data layer abstraction in `src/data.js`.
- **docker-compose.yml** — Postgres 16 for local dev.
- Razorpay (advance+balance, stubbed to UPI link), WhatsApp click-to-chat now / Cloud API
  webhook later, all behind feature checks.

## Core modules
Rooms (10–15%), Tents (10–15%), Cabs (12–18%), Food (15–20%, Phase 3), Route guidance,
Emergency (one-tap medical/police/lost + GPS), Parking (Phase 3). WhatsApp support is the
connective layer.

## Data model (Postgres, `migrations/0001_init.sql`)
`customers, vendors, inventory, bookings (status lead|quoted|confirmed|fulfilled|cancelled),
payments (advance|balance|payout|refund), support_tickets, promotions`. The file store mirrors
the same shapes. Sample Nashik/Trimbakeshwar vendors in `server/src/lib/mock-data.js`.

## Key flows (all implemented)
- **Booking:** /book → pick service → details → `POST /api/leads` → WhatsApp handoff → 20%
  advance via `POST /api/payments` (Razorpay order or UPI deep link).
- **Emergency:** category → share GPS → nearest desk (haversine over HELP_DESKS) → call 112/desk
  + WhatsApp agent.
- **Vendor onboarding:** /vendors signup → admin verifies KYC → toggle live → appears on the
  public service pages.
- **Admin (/admin):** bearer-token login; add/verify/toggle/delete vendors, add/status/delete
  bookings, add/status/delete tickets. Everything persists (Postgres or file).

## Design tokens
`--ink #241B2E --muted #6E6580 --cream #FCF8F1 --line #E8DFCF --saffron #E2701A
--saffron-dark #B9530E --gold #D8A12B --plum #3B2B57 --plum-light #5B4684 --teal #117C73
--rose #C0436A`; WhatsApp green #25D366. Fonts: Plus Jakarta Sans (headings), Inter (body),
Fraunces (display). Verified Unsplash imagery + custom SVG service icons + diya brand mark.

## Routes
`/` `/services` `/services/:slug` `/kumbh-guide` `/how-it-works` `/book` `/vendors` `/about`
`/safety` `/contact` `/privacy` `/refunds` `/terms` `/emergency` `/admin`.

## Status
Complete and verified. React UI ↔ Express API ↔ store (Postgres-ready, file fallback active in
dev). Postgres path is code-complete; activate with `docker compose up -d` + `db:migrate` +
`db:seed`. Stubbed-until-keys: Razorpay capture, WhatsApp Cloud API automation.
