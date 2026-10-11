import 'server-only'
import { randomUUID } from 'node:crypto'

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`
}

export function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') return new Date(v).toISOString()
  return new Date(0).toISOString()
}

export function isoOrNull(v: unknown): string | null {
  return v === null || v === undefined ? null : iso(v)
}

export function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

export function numOrNull(v: unknown): number | null {
  return v === null || v === undefined ? null : num(v)
}

/** JSON columns arrive parsed from pg, but defensively accept strings too. */
export function json<T>(v: unknown, fallback: T): T {
  if (v === null || v === undefined) return fallback
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return fallback
    }
  }
  return v as T
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
