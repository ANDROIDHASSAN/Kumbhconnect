-- ─────────────────────────────────────────────────────────────
-- Kumbh Connect — initial schema (Phase 1)
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------
do $$ begin
  create type service_type as enum ('rooms','tents','cabs','food','routes','emergency','parking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('lead','quoted','confirmed','fulfilled','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_kind as enum ('advance','balance','payout','refund');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('created','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_status as enum ('pending','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type channel as enum ('web','whatsapp','phone');
exception when duplicate_object then null; end $$;

-- Tables -------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  language text not null default 'en',
  party_size int,
  segment text,
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  type service_type not null,
  name text not null,
  area text not null,
  lat double precision,
  lng double precision,
  rates_json jsonb,
  capacity int,
  kyc_status kyc_status not null default 'pending',
  rating numeric(2,1),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  service_type service_type not null,
  date date not null,
  units_total int not null default 0,
  units_available int not null default 0,
  price numeric(10,2) not null default 0
);
create index if not exists inventory_vendor_date_idx on inventory(vendor_id, date);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  service_type service_type not null,
  status booking_status not null default 'lead',
  start_date date,
  end_date date,
  party_size int,
  amount numeric(10,2),
  commission numeric(10,2),
  channel channel not null default 'web',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists bookings_status_idx on bookings(status, created_at desc);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  kind payment_kind not null,
  amount numeric(10,2) not null,
  status payment_status not null default 'created',
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  category text not null,
  channel channel not null default 'web',
  status text not null default 'open',
  sla_due timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  tier text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount numeric(10,2) not null
);

-- Row Level Security -------------------------------------------------------
-- Public can READ active vendors + inventory (for the listing pages).
-- Writes (leads, signups, tickets) go through the server using the service
-- role key, which bypasses RLS. Anon clients get read-only public data.
alter table vendors enable row level security;
alter table inventory enable row level security;
alter table customers enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table support_tickets enable row level security;
alter table promotions enable row level security;

drop policy if exists "public read active vendors" on vendors;
create policy "public read active vendors" on vendors
  for select using (active = true);

drop policy if exists "public read inventory" on inventory;
create policy "public read inventory" on inventory
  for select using (true);

-- No anon policies on customers/bookings/payments/tickets/promotions:
-- they are server-only (service role). RLS therefore denies anon access.
