const formatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(amount: number, currency = 'USD', locale = 'en-US', opts: { cents?: boolean } = {}) {
  const showCents = opts.cents ?? !Number.isInteger(amount)
  const key = `${locale}|${currency}|${showCents}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    })
    formatters.set(key, f)
  }
  return f.format(amount)
}

export function formatDate(iso: string, locale = 'en-US', opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat(locale, opts).format(new Date(iso))
}

export function discountPercent(price: number, compareAt: number | null | undefined) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export const TIER_LABEL: Record<string, string> = {
  thread: 'Thread',
  stitch: 'Stitch',
  weave: 'Weave',
  tapestry: 'Tapestry',
}

/** Loyalty levels by points balance (mirrors tierFor() on the server). */
export const TIERS = [
  { id: 'thread', name: 'Thread', min: 0 },
  { id: 'stitch', name: 'Stitch', min: 500 },
  { id: 'weave', name: 'Weave', min: 1500 },
  { id: 'tapestry', name: 'Tapestry', min: 3000 },
] as const
