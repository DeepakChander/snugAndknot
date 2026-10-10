import 'server-only'
import { MIGRATIONS, LATEST_SCHEMA_VERSION } from './migrations'
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
}

const NUMERIC_OID = 1700
const INT8_OID = 20

function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined
}

async function createPostgres(url: string): Promise<Db> {
  const pg = await import('pg')
  const { Pool, types } = pg.default ?? pg
  // Money and counts come back as JS numbers rather than strings.
  types.setTypeParser(NUMERIC_OID, (v: string) => parseFloat(v))
  types.setTypeParser(INT8_OID, (v: string) => Number(v))

  const pool = new Pool({
    connectionString: url,
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
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
      await q.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [m.version, m.name])
    }
    // Seed exactly once — when the schema is first created. Deleting every product
    // in the admin later must not bring the demo catalogue back.
    if (freshDatabase) await seedDatabase(q)
  })
}

type GlobalWithDb = typeof globalThis & { __snugknotDb?: Promise<Db> }

/** Lazily connected, migrated and seeded database handle (one per server instance). */
export function getDb(): Promise<Db> {
  const g = globalThis as GlobalWithDb
  if (!g.__snugknotDb) {
    g.__snugknotDb = (async () => {
      const url = connectionString()
      const db = url ? await createPostgres(url) : await createPglite()
      await migrate(db)
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
