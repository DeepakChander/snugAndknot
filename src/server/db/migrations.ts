/**
 * Versioned schema migrations. Each entry runs exactly once, in order, inside
 * a transaction (see ./client.ts). Never edit a shipped migration — append a new one.
 *
 * The SQL here is plain PostgreSQL 16 and also runs on PGlite (the zero-config
 * fallback used when DATABASE_URL is not set).
 */
export const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: 'initial-commerce-schema',
    sql: `
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  points         INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  phone          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS categories (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  image        TEXT NOT NULL DEFAULT '',
  position     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  handle            TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  details           JSONB NOT NULL DEFAULT '{}'::jsonb,
  vendor            TEXT NOT NULL DEFAULT 'Snug&Knot',
  product_type      TEXT NOT NULL DEFAULT '',
  gender            TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  category          TEXT NOT NULL DEFAULT '',
  tags              TEXT[] NOT NULL DEFAULT '{}',
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price  NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  images            JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors            JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes             TEXT[] NOT NULL DEFAULT '{}',
  featured          BOOLEAN NOT NULL DEFAULT false,
  is_new            BOOLEAN NOT NULL DEFAULT false,
  bestseller        BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_status_idx ON products (status);
CREATE INDEX IF NOT EXISTS products_gender_idx ON products (gender);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);

CREATE TABLE IF NOT EXISTS variants (
  id                TEXT PRIMARY KEY,
  product_id        TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  sku               TEXT NOT NULL,
  size              TEXT,
  color             TEXT,
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price  NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  inventory         INTEGER NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  position          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS variants_product_idx ON variants (product_id);
CREATE UNIQUE INDEX IF NOT EXISTS variants_sku_key ON variants (sku);

CREATE TABLE IF NOT EXISTS collections (
  id           TEXT PRIMARY KEY,
  handle       TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  subtitle     TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  image        TEXT NOT NULL DEFAULT '',
  product_ids  TEXT[] NOT NULL DEFAULT '{}',
  featured     BOOLEAN NOT NULL DEFAULT false,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id           TEXT PRIMARY KEY,
  product_id   TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  user_id      TEXT REFERENCES users (id) ON DELETE SET NULL,
  author       TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  fit          TEXT CHECK (fit IS NULL OR fit IN ('small', 'true', 'large')),
  verified     BOOLEAN NOT NULL DEFAULT false,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful      INTEGER NOT NULL DEFAULT 0 CHECK (helpful >= 0),
  admin_reply  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_product_status_idx ON reviews (product_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user_key ON reviews (product_id, user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS coupons (
  code          TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value         NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  min_purchase  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_purchase >= 0),
  description   TEXT NOT NULL DEFAULT '',
  expires_at    DATE,
  active        BOOLEAN NOT NULL DEFAULT true,
  usage_limit   INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count    INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupons_percentage_max CHECK (type <> 'percentage' OR value <= 100)
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,
  user_id           TEXT REFERENCES users (id) ON DELETE SET NULL,
  email             TEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'placed'
                    CHECK (status IN ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method    TEXT NOT NULL DEFAULT 'cod',
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  shipping_method   TEXT NOT NULL DEFAULT 'standard',
  subtotal          NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping          NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  discount          NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax               NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total             NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  coupon_code       TEXT,
  shipping_address  JSONB NOT NULL,
  tracking_number   TEXT,
  notes             TEXT,
  points_earned     INTEGER NOT NULL DEFAULT 0,
  placed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at      TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (lower(email));
CREATE INDEX IF NOT EXISTS orders_placed_idx ON orders (placed_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id  TEXT,
  variant_id  TEXT,
  handle      TEXT NOT NULL,
  title       TEXT NOT NULL,
  image       TEXT NOT NULL DEFAULT '',
  size        TEXT,
  color       TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

CREATE TABLE IF NOT EXISTS returns (
  id             TEXT PRIMARY KEY,
  order_id       TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  user_id        TEXT REFERENCES users (id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'received', 'refunded')),
  reason         TEXT NOT NULL CHECK (reason IN ('wrong-size', 'defective', 'not-as-described', 'changed-mind', 'other')),
  comments       TEXT,
  items          JSONB NOT NULL,
  refund_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS returns_user_idx ON returns (user_id);

CREATE TABLE IF NOT EXISTS subscribers (
  email       TEXT PRIMARY KEY,
  source      TEXT NOT NULL DEFAULT 'footer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id          TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  variant_id  TEXT,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS stock_alerts_unique_key ON stock_alerts (product_id, COALESCE(variant_id, ''), lower(email));

CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  mime        TEXT NOT NULL CHECK (mime IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif')),
  size        INTEGER NOT NULL CHECK (size > 0),
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`,
  },
  {
    version: 2,
    name: 'security',
    sql: `
-- Bumped on password change and role change: every session signed with an older value stops working.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;
-- The account whose credentials live in ADMIN_EMAIL / ADMIN_PASSWORD. It can only sign in through
-- those variables, so rotating or removing them locks out the old password and old sessions.
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_by_env BOOLEAN NOT NULL DEFAULT false;

-- Fixed-window rate limits shared by every server instance. Keys are SHA-256 hashes, never raw
-- emails or IP addresses.
CREATE TABLE IF NOT EXISTS rate_limits (
  key       TEXT PRIMARY KEY,
  count     INTEGER NOT NULL,
  reset_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_reset_at_idx ON rate_limits (reset_at);

-- Staff notes live apart from the customer's checkout note, which the customer can see.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
`,
  },
  {
    version: 3,
    name: 'refresh-default-copy',
    // The storefront copy was rewritten (src/lib/settings-defaults.ts), but defaults only reach a
    // database when it is first seeded. Each field (or link label and target together) moves to the
    // new wording only while it still holds the old default, so anything edited in the admin stays.
    // On a fresh database this matches no rows and the seed writes the new defaults.
    sql: `
UPDATE settings SET value = jsonb_set(value, '{tagline}', to_jsonb('Hand-finished knitwear, made in small runs.'::text)), updated_at = now()
 WHERE key = 'store' AND value->>'tagline' = 'Where tension becomes tenderness.';
UPDATE settings SET value = jsonb_set(value, '{description}', to_jsonb('Knitwear in merino, cashmere blends and long-staple cotton — made in small runs and finished by hand.'::text)), updated_at = now()
 WHERE key = 'store' AND value->>'description' = 'Textiles knotted at the crossroads of tradition and nerve. Every thread earns its place.';

UPDATE settings SET value = jsonb_set(value, '{messages}', '["Free shipping on orders over $150", "Hand-finished in small batches", "30-day returns on unworn pieces"]'::jsonb), updated_at = now()
 WHERE key = 'announcement' AND value->'messages' = '["Complimentary shipping on orders over $150", "Hand-finished in small batches", "30-day returns, no questions asked"]'::jsonb;

UPDATE settings SET value = jsonb_set(value, '{heroEyebrow}', to_jsonb('Autumn–Winter 2026'::text)), updated_at = now()
 WHERE key = 'homepage' AND value->>'heroEyebrow' = 'Autumn / Winter Atelier';
UPDATE settings SET value = jsonb_set(value, '{heroTitle}', to_jsonb('Knitwear made slowly, *to wear for years*.'::text)), updated_at = now()
 WHERE key = 'homepage' AND value->>'heroTitle' = 'Knitted slowly. Worn for a lifetime.';
UPDATE settings SET value = jsonb_set(value, '{heroSubtitle}', to_jsonb('Merino, cashmere blends and long-staple cotton — knitted in small runs and finished by hand.'::text)), updated_at = now()
 WHERE key = 'homepage' AND value->>'heroSubtitle' = 'Merino, cashmere and long-staple cotton — knotted by hand in small batches, finished with intention.';
UPDATE settings SET value = value || '{"primaryCtaLabel": "Shop new in", "primaryCtaHref": "/shop?sort=newest"}'::jsonb, updated_at = now()
 WHERE key = 'homepage' AND value->>'primaryCtaLabel' = 'Shop the collection' AND value->>'primaryCtaHref' = '/shop';
UPDATE settings SET value = value || '{"secondaryCtaLabel": "See the collections", "secondaryCtaHref": "/collections"}'::jsonb, updated_at = now()
 WHERE key = 'homepage' AND value->>'secondaryCtaLabel' = 'Inside the atelier' AND value->>'secondaryCtaHref' = '/about';
UPDATE settings SET value = jsonb_set(value, '{manifesto}', to_jsonb('We make a short list of knitwear and make it properly: natural fibres, small runs, and every piece *finished by hand* before it is folded and sent to you.'::text)), updated_at = now()
 WHERE key = 'homepage' AND value->>'manifesto' = 'Tension is not the enemy of softness. Every knot is a decision, every thread earns its place, and the loom does not rush.';

UPDATE settings SET value = jsonb_set(value, '{description}', to_jsonb('Hand-finished knitwear in merino, cashmere blends and long-staple cotton: cardigans and knit tees made in small runs to be worn for years.'::text)), updated_at = now()
 WHERE key = 'seo' AND value->>'description' = 'Luxury knitwear knotted by hand: merino, cashmere and long-staple cotton cardigans and knit tees, made in small batches to last a lifetime.';
-- The old share image and the seeded collection image show a weaving loom, not knitting. The new share
-- image is a 1200x630 picture of three of the pieces.
UPDATE settings SET value = jsonb_set(value, '{ogImage}', to_jsonb('/images/og/snugandknot.jpg'::text)), updated_at = now()
 WHERE key = 'seo' AND value->>'ogImage' = '/images/Collections-Hero/Artisan.png';
UPDATE collections SET image = '/images/collection-home/Artisan''s.png', updated_at = now()
 WHERE handle = 'the-artisan-edit' AND image = '/images/Collections-Hero/Artisan.png';
`,
  },
  {
    version: 4,
    name: 'terracotta-button-copy',
    // The terracotta cardigan's photographs show pale buttons, not the wooden ones its seeded copy
    // promised. Only the seeded wording is changed; text edited in the admin is left alone.
    sql: `
UPDATE products SET description = replace(description, 'Featuring our signature wooden button detailing, this cardigan', 'Finished with a row of pale buttons down the front, this cardigan'), updated_at = now()
 WHERE handle = 'terracotta-textured-cardigan' AND description LIKE '%Featuring our signature wooden button detailing, this cardigan%';
UPDATE products SET details = jsonb_set(details, '{features}', (
         SELECT jsonb_agg(CASE WHEN f = to_jsonb('Natural wooden button closure'::text) THEN to_jsonb('Button-front closure'::text) ELSE f END ORDER BY n)
           FROM jsonb_array_elements(details->'features') WITH ORDINALITY AS t(f, n))), updated_at = now()
 WHERE handle = 'terracotta-textured-cardigan' AND details->'features' @> '["Natural wooden button closure"]'::jsonb;
UPDATE categories SET description = 'Cable, diamond and heritage stitches, buttoned down the front.'
 WHERE slug = 'cardigans' AND description = 'Cable, texture and heritage stitches, finished with natural wooden buttons.';
`,
  },
  {
    version: 5,
    name: 'seeded-products-modified-now',
    // Seeded products carried their 2024 launch date as their last change, so the sitemap told search
    // engines nothing had changed since then. Rows nobody has edited (updated_at still equals the
    // seeded created_at) move to now; anything edited in the admin already has a later date.
    sql: `
UPDATE products SET updated_at = now() WHERE updated_at = created_at AND created_at < '2025-01-01';
`,
  },
  {
    version: 6,
    name: 'notifications',
    // Every email to the store's support inbox is recorded here before it is sent, so a mail outage
    // loses nothing: failed sends are retried with a back-off, and the log shows what went out.
    // dedupe_slot makes "one notice per key per window" atomic; claimed_at times a send in progress.
    sql: `
CREATE TABLE IF NOT EXISTS notifications (
  id               TEXT PRIMARY KEY,
  type             TEXT NOT NULL,
  subject          TEXT NOT NULL,
  body_text        TEXT NOT NULL,
  body_html        TEXT NOT NULL,
  to_email         TEXT NOT NULL,
  reply_to         TEXT,
  dedupe_key       TEXT,
  dedupe_slot      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped', 'suppressed')),
  attempts         INTEGER NOT NULL DEFAULT 0,
  error            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at       TIMESTAMPTZ,
  next_attempt_at  TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications (status, created_at);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at);
CREATE INDEX IF NOT EXISTS notifications_dedupe_idx ON notifications (type, dedupe_key, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_slot_idx ON notifications (type, dedupe_slot) WHERE dedupe_slot IS NOT NULL;

-- The store's public address moves from hello@ to support@ (only where it is still the old default).
UPDATE settings SET value = jsonb_set(value, '{email}', to_jsonb('support@snugandknot.com'::text)), updated_at = now()
 WHERE key = 'store' AND value->>'email' = 'hello@snugandknot.com';
`,
  },
  {
    version: 7,
    name: 'razorpay-payments',
    // Online payments. An order paid online is saved as 'pending_payment' (its stock held) until the
    // payment is verified, then becomes 'placed'. Only adds: older code keeps working on this schema.
    // The status check is found by its definition rather than by name, so a differently named
    // constraint cannot survive and keep refusing the new status.
    sql: `
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'orders'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) LIKE '%status%' AND pg_get_constraintdef(oid) NOT LIKE '%payment_status%'
  LOOP
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
-- Set once, when an online payment is confirmed. NULL on cash-on-delivery orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_key ON orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_pending_payment_idx ON orders (placed_at) WHERE status = 'pending_payment';
`,
  },
  {
    version: 8,
    name: 'category-home-grid',
    // The home page's "Shop by category" tiles. badge is an optional short pill beside the name
    // (e.g. "3XL TO 6XL"); show_on_home lets the admin keep a category off the grid. Only adds
    // columns with defaults, so existing rows land on the grid with no badge and older code keeps working.
    sql: `
ALTER TABLE categories ADD COLUMN IF NOT EXISTS badge TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT true;
`,
  },
]

export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
