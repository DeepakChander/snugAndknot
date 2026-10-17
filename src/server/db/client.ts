import 'server-only'
import { MIGRATIONS, LATEST_SCHEMA_VERSION } from './migrations'
import { databaseUrl, shopVariableNames } from './url'
import { seedDatabase } from './seed'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>

export interface Queryable {
  /** Parameterised query ($1, $2 …). Returns rows. */
  query<T = Row>(text: string, params?: unknown[]): Promise<T[]>
  /** Multi-statement SQL with no parameters (migrations only). */
  exec(sql: string): Promise<void>
}

export interface Db extends Queryable {
  kind: 'postgres' | 'pglite'
  /** false when running on the in-memory fallback — writes vanish on restart. */
  persistent: boolean
  tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T>
  /** Closes the connections (Postgres only). */
  close?(): Promise<void>
}

const NUMERIC_OID = 1700
const INT8_OID = 20

/** See ./url for the order in which variables are tried. */
function connectionString(): string | undefined {
  return databaseUrl()?.url
}

/** Every table the migrations create — used to recognise a database that belongs to another app. */
const SHOP_TABLES = ['settings', 'users', 'categories', 'products', 'variants', 'collections', 'reviews', 'coupons', 'orders', 'order_items', 'returns', 'subscribers', 'messages', 'stock_alerts', 'media', 'rate_limits', 'notifications']

function isLocalHost(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]' || host === ''
  } catch {
    return false
  }
}

async function createPostgres(url: string): Promise<Db> {
  const pg = await import('pg')
  const { Pool, types } = pg.default ?? pg
  // Money and counts come back as JS numbers rather than strings.
  types.setTypeParser(NUMERIC_OID, (v: string) => parseFloat(v))
  types.setTypeParser(INT8_OID, (v: string) => Number(v))

  const pool = new Pool({
    connectionString: url,
    // Remote databases are reached over TLS with the server certificate verified. An sslmode
    // in the URL takes precedence over this (pg lets connection-string settings win).
    ssl: isLocalHost(url) ? undefined : { rejectUnauthorized: true },
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    // No single query may hold a connection for more than 15 seconds.
    statement_timeout: 15_000,
    query_timeout: 20_000,
  })

  const db: Db = {
    kind: 'postgres',
    persistent: true,
    async query(text, params) {
      const res = await pool.query(text, params as any[])
      return res.rows
    },
    async exec(sql) {
      await pool.query(sql)
    },
    async close() {
      await pool.end()
    },
    async tx(fn) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const q: Queryable = {
          query: async (text, params) => (await client.query(text, params as any[])).rows,
          exec: async (sql) => {
            await client.query(sql)
          },
        }
        const result = await fn(q)
        await client.query('COMMIT')
        return result
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {})
        throw err
      } finally {
        client.release()
      }
    },
  }
  return db
}

async function createPglite(): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite')
  // Persist to disk only for local `next dev`. Builds, `next start` and serverless
  // instances get a fresh in-memory database seeded from src/data.
  const persistent = process.env.NODE_ENV === 'development' && !process.env.VERCEL
  const dataDir = persistent ? `${process.cwd()}/.data/pglite` : undefined
  // PGlite creates only the leaf directory, not its parents.
  if (dataDir) (await import('node:fs')).mkdirSync(dataDir, { recursive: true })
  const lite = new PGlite(dataDir, {
    parsers: {
      [NUMERIC_OID]: (v: string) => parseFloat(v),
      [INT8_OID]: (v: string) => Number(v),
    },
  })
  await lite.waitReady

  const db: Db = {
    kind: 'pglite',
    persistent,
    async query(text, params) {
      const res = await lite.query(text, params as any[])
      return res.rows as any[]
    },
    async exec(sql) {
      await lite.exec(sql)
    },
    async tx(fn) {
      return lite.transaction(async (t) => {
        const q: Queryable = {
          query: async (text, params) => (await t.query(text, params as any[])).rows as any[],
          exec: async (sql) => {
            await t.exec(sql)
          },
        }
        return fn(q)
      })
    },
  }
  return db
}

async function currentSchemaVersion(db: Db): Promise<number> {
  try {
    const rows = await db.query<{ v: number }>('SELECT coalesce(max(version), 0) AS v FROM schema_migrations')
    return Number(rows[0]?.v ?? 0)
  } catch (err: any) {
    if (err?.code === '42P01' || /schema_migrations/.test(String(err?.message))) return 0
    throw err
  }
}

async function migrate(db: Db) {
  // One round trip on every cold start; the work below only runs on a fresh or outdated database.
  if ((await currentSchemaVersion(db)) >= LATEST_SCHEMA_VERSION) return

  await db.tx(async (q) => {
    if (db.kind === 'postgres') {
      // Two cold starts racing on an empty database must not both migrate.
      await q.query('SELECT pg_advisory_xact_lock(727274)')
      // A database the shop has never migrated must not already hold tables with the shop's names:
      // they belong to another app, and migrating over them would fail or, worse, change them.
      const [{ ours }] = await q.query<{ ours: string | null }>(`SELECT to_regclass('schema_migrations')::text AS ours`)
      if (!ours) {
        const clash = await q.query<{ name: string }>(
          `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = ANY($1)`,
          [SHOP_TABLES]
        )
        if (clash.length) {
          throw new Error(
            `The database in ${databaseUrl()?.from} already has tables named ${clash.map((c) => c.name).join(', ')} ` +
              'from another app. Snug&Knot needs an empty database (or one it created itself): set ' +
              `SNUGKNOT_DATABASE_URL to one. Variables starting with SNUGKNOT: ${shopVariableNames().join(', ') || 'none'}. ` +
              'Nothing was changed.'
          )
        }
      }
    }
    await q.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version     INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
    const applied = new Set(
      (await q.query<{ version: number }>('SELECT version FROM schema_migrations')).map((r) => Number(r.version))
    )
    const freshDatabase = applied.size === 0
    for (const m of MIGRATIONS) {
      if (applied.has(m.version)) continue
      await q.exec(m.sql)
      if (m.run) await m.run(q)
      await q.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [m.version, m.name])
    }
    // Seed exactly once — when the schema is first created. Deleting every product
    // in the admin later must not bring the demo catalogue back.
    if (freshDatabase) await seedDatabase(q)
  })
}

/**
 * Marks the ADMIN_EMAIL account as managed by the environment on every cold start, so it can
 * only sign in with ADMIN_PASSWORD. This covers rows written before that flag existed, and a
 * customer account someone registered with the owner's address before it became the admin
 * address. Flagging also ends that row's existing sessions. Idempotent.
 */
async function claimOwnerAccount(db: Db) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!email) return
  await db.query(
    `UPDATE users SET managed_by_env = true, session_version = session_version + 1
      WHERE lower(email) = $1 AND managed_by_env = false`,
    [email]
  )
}

type GlobalWithDb = typeof globalThis & { __snugknotDb?: Promise<Db> }

/** Lazily connected, migrated and seeded database handle (one per server instance). */
export function getDb(): Promise<Db> {
  const g = globalThis as GlobalWithDb
  if (!g.__snugknotDb) {
    g.__snugknotDb = (async () => {
      const url = connectionString()
      let db = url ? await createPostgres(url) : await createPglite()
      // A preview deployment must never migrate a database: it may be the one production uses, and
      // the change would go live before the pull request is merged. When the code is ahead of the
      // database, the preview runs on the seeded in-memory fallback instead.
      if (db.kind === 'postgres' && process.env.VERCEL_ENV === 'preview' && (await currentSchemaVersion(db)) < LATEST_SCHEMA_VERSION) {
        console.warn('[db] Preview deployment with a database behind this code: using the in-memory demo database, nothing was migrated.')
        await db.close?.()
        db = await createPglite()
      }
      await migrate(db)
      await claimOwnerAccount(db)
      return db
    })().catch((err) => {
      // Allow the next request to retry rather than caching a failed connection forever.
      g.__snugknotDb = undefined
      throw err
    })
  }
  return g.__snugknotDb
}

export async function query<T = Row>(text: string, params?: unknown[]): Promise<T[]> {
  const db = await getDb()
  return db.query<T>(text, params)
}

export async function tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T> {
  const db = await getDb()
  return db.tx(fn)
}
