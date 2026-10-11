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
]

export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
