# Kumbh Connect 🪔 — PERN stack

**One Trusted Digital Partner for Kumbh Visitors** — a mobile-first help & booking platform
for the **Nashik–Trimbakeshwar Simhastha Kumbh Mela 2027**.

Built on a clean **PERN** stack — **P**ostgreSQL · **E**xpress · **R**eact · **N**ode — no
Next.js. Stays, tents, cabs, food, route guidance, parking and one-tap emergency help, with a
live WhatsApp layer over every flow.

```
client/   React (Vite) + Tailwind + React Router + i18n (EN/HI/MR)
server/   Express + node-postgres (pg)  — REST API
```

The server uses **Postgres** when `DATABASE_URL` is set, and otherwise falls back to a
**JSON file store** (`server/.data/store.json`) so the whole app runs with zero setup.

---

## 🚀 Quick start (no database needed)

```bash
npm install            # installs both workspaces
npm run dev            # starts API (:4000) + client (:5173) together
```

Open the client (Vite prints the URL, usually http://localhost:5173). The React app calls the
Express API through Vite's dev proxy (`/api → :4000`). Leads, vendor signups and admin records
persist to `server/.data/store.json`.

**Admin:** open `/admin`, password `kumbh2027` (change `ADMIN_PASSWORD` in `server/.env`).

---

## 🐘 Use real Postgres (the "P" in PERN)

No Docker needed. Point `DATABASE_URL` at **any** Postgres — a free hosted one
(Render, Neon, Supabase) or a local install:

```bash
# server/.env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
```

Then just `npm run dev`. On connect the server **auto-creates the schema and seeds sample
vendors** (no manual steps), and `/api/health` reports `"store":"postgres"`. SSL for hosted
databases is handled automatically. The data layer (`server/src/data.js`) implements both the
Postgres and file paths behind one interface, so nothing else changes.

> Want to seed/migrate manually instead? `npm run db:migrate` and `npm run db:seed` are there.

---

## 🧱 Architecture

### Server (`server/`)
| File | Role |
|------|------|
| `src/index.js` | Express app: CORS, JSON, routers, health check |
| `src/db.js` | Postgres pool + reachability detection (falls back to file store) |
| `src/store-file.js` | JSON file persistence used when Postgres is absent |
| `src/data.js` | Data layer — every function has a Postgres path and a file path |
| `src/routes/public.js` | `GET /services/:slug/vendors`, `POST /leads`, `POST /vendors`, `POST /payments`, `GET /emergency/desks` |
| `src/routes/admin.js` | `POST /admin/login` (bearer token) + CRUD for vendors/bookings/tickets |
| `src/routes/webhooks.js` | WhatsApp Cloud API + Razorpay webhooks |
| `migrations/0001_init.sql` | Schema: customers, vendors, inventory, bookings, payments, support_tickets, promotions (+ RLS) |
| `seed.js` | Loads sample vendors + inventory into Postgres |

### Client (`client/`)
| Area | Notes |
|------|-------|
| `src/pages/*` | One component per route (Home, Services, ServiceDetail, Guide, Book, Vendors, About, Safety, Contact, Legal, Emergency, Admin) |
| `src/components/*` | Reusable UI kit + feature components (cards, forms, header/footer, icons) |
| `src/lib/api.ts` | Typed fetch client for the Express API (bearer token for admin) |
| `src/i18n/*` | EN / हिंदी / मराठी via a small React context (`useTranslations`, `useLocale`) |
| `src/shims/*` | Thin adapters so shared components run under Vite (mapped in `vite.config.ts`) |

---

## 🔌 API surface

```
GET    /api/health
GET    /api/services/:slug/vendors      → vendors for a service
GET    /api/emergency/desks             → nearest-desk reference data
POST   /api/leads                       → capture a booking lead
POST   /api/vendors                     → vendor self-signup (pending KYC)
POST   /api/payments                    → Razorpay order or stubbed UPI link
POST   /api/admin/login                 → { token }
GET    /api/admin/data                  → bookings + vendors + tickets   (Bearer)
POST   /api/admin/vendors               → add vendor (goes live on the site) (Bearer)
PATCH  /api/admin/vendors/:id           → edit / toggle live (Bearer)
POST   /api/admin/vendors/:id/verify    → KYC verify + activate (Bearer)
DELETE /api/admin/vendors/:id           (Bearer)
POST   /api/admin/bookings              (Bearer)   PATCH/DELETE /:id
POST   /api/admin/tickets               (Bearer)   PATCH/DELETE /:id
GET|POST /api/webhooks/whatsapp         → Cloud API handshake + inbound intent capture
POST   /api/webhooks/razorpay           → signature-verified payment confirmation
```

Admin auth is a bearer token returned by `/admin/login` (sha256 of the password). The client
stores it in `localStorage` and replays it on protected calls.

---

## ✨ Features

- **Add & manage from /admin** — create vendors (instantly live on the site), bookings and
  tickets; verify KYC, toggle live, change status, delete. Everything persists.
- **End-to-end booking** — pick service → details → lead saved → WhatsApp handoff → 20% advance
  (Razorpay order, or a UPI deep-link when keys are absent).
- **Emergency** — geolocation → nearest desk (haversine) → one-tap call + WhatsApp agent.
- **i18n** — English / हिंदी / मराठी, switchable live.
- **Imagery & design** — verified photography, custom SVG iconography, Fraunces display type,
  warm devotional palette, responsive from 360px up.

## 🔑 Optional integrations (all gracefully stubbed)
Set these in `server/.env` (server) or `client/.env` (client) to go live:
`DATABASE_URL`, `RAZORPAY_KEY_ID/SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
`WHATSAPP_API_TOKEN/PHONE_NUMBER_ID`, `VITE_WHATSAPP_NUMBER`, `VITE_API_URL`.

## ☁️ Deploy — Backend on Render, Frontend on Vercel

The app splits cleanly: **Render** runs the Express API + managed Postgres; **Vercel** serves the
React SPA and proxies `/api/*` to Render (so the browser stays same-origin — no CORS).

### 1) Backend → Render (`render.yaml` Blueprint)
1. Push this repo to GitHub.
2. Render → **New → Blueprint → pick the repo → Apply.** It provisions a free Postgres + the
   API web service. On first boot the server **auto-creates the schema and seeds sample vendors**
   (no manual migrate/seed).
3. Copy the live service URL, e.g. `https://kumbh-connect.onrender.com`.
4. In the Render dashboard set `CLIENT_ORIGIN` to your Vercel URL, and change `ADMIN_PASSWORD`.
   (Cloudinary/Razorpay/WhatsApp keys are optional — blank = gracefully stubbed.)

Health check: `GET /api/health`. The Blueprint runs `npm install` then `npm start` (API only).

### 2) Frontend → Vercel (`vercel.json`)
1. **Edit `vercel.json`** → replace the rewrite host with your real Render URL from step 3:
   ```json
   { "source": "/api/:path*", "destination": "https://YOUR-SERVICE.onrender.com/api/:path*" }
   ```
2. Vercel → **New Project → import the repo.** It picks up `vercel.json` automatically
   (`npm run build` → `client/dist`).
3. Set Vercel env vars (Project → Settings → Environment Variables):
   - `VITE_WHATSAPP_NUMBER` = your WhatsApp number (e.g. `9199…`)
   - `VITE_SITE_URL` = your Vercel domain (for canonical/OG tags)
   - *(do not set `VITE_API_URL` — `/api` is proxied to Render by `vercel.json`)*
4. Deploy. Open the Vercel URL; `/admin` logs into the Render API through the proxy.

> **One required edit:** the Render host in `vercel.json` (Render only knows its URL after the
> backend deploys). Everything else is automatic.

### Single-service alternative
Prefer one service? You can still run everything on Render alone — set the build to
`npm install --include=dev && npm run build` and `NODE_ENV=production`; Express then serves
`client/dist` + `/api` from one URL. (Verified locally.)

> See `CONTEXT.md` for the full product spec.
