-- ─────────────────────────────────────────────────────────────
-- Kumbh Connect — vendor image
-- Adds a hosted image URL (e.g. Cloudinary secure_url) to vendors so the
-- public listing pages can show a photo. Idempotent.
-- ─────────────────────────────────────────────────────────────

alter table vendors add column if not exists image_url text;
