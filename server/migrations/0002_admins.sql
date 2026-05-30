-- ─────────────────────────────────────────────────────────────
-- Admin accounts — per-person login (email + scrypt-hashed password).
-- Replaces the single shared password. Server-only table (RLS, no anon policy).
-- ─────────────────────────────────────────────────────────────
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',          -- 'owner' | 'admin'
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;   -- server connects as table owner → bypasses RLS
