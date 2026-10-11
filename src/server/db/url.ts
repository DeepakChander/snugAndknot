/**
 * Which database the shop uses. In order:
 *  1. SNUGKNOT_DATABASE_URL.
 *  2. Any other variable whose name starts with SNUGKNOT and holds a Postgres connection string —
 *     a hosting integration connected with a custom prefix names them in its own way
 *     (e.g. SNUGKNOT_DATABASE_DATABASE_URL, SNUGKNOT_POSTGRES_URL). Pooled URLs win over direct ones.
 *  3. DATABASE_URL.
 * Variables such as POSTGRES_URL without the prefix are never read: the shop only writes to a
 * database it was explicitly given.
 */
const POSTGRES = /^postgres(ql)?:\/\//i

export function shopVariableNames(env: NodeJS.ProcessEnv = process.env): string[] {
  return Object.keys(env)
    .filter((k) => k.startsWith('SNUGKNOT'))
    .sort()
}

function rank(name: string): number {
  // Lower is better: the pooled connection string first, then plain URLs, then direct/variant ones.
  if (/UNPOOLED|NON_POOLING|NO_SSL|PRISMA/.test(name)) return 3
  if (/DATABASE_URL$/.test(name)) return 0
  if (/POSTGRES_URL$/.test(name)) return 1
  return 2
}

export function databaseUrl(env: NodeJS.ProcessEnv = process.env): { url: string; from: string } | undefined {
  if (env.SNUGKNOT_DATABASE_URL) return { url: env.SNUGKNOT_DATABASE_URL, from: 'SNUGKNOT_DATABASE_URL' }
  const prefixed = shopVariableNames(env)
    .filter((k) => POSTGRES.test(env[k] ?? ''))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))[0]
  if (prefixed) return { url: env[prefixed]!, from: prefixed }
  if (env.DATABASE_URL) return { url: env.DATABASE_URL, from: 'DATABASE_URL' }
  return undefined
}
