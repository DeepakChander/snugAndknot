#!/usr/bin/env node
/**
 * End-to-end test of changing the main currency (Admin → Settings → Checkout & shipping → Change
 * main currency): USD → INR at a known rate, then every amount is checked against the database.
 * It really switches the shop's currency, so run it on a throwaway database of its own:
 *
 *   createdb snugknot_switch_test
 *   SNUGKNOT_DATABASE_URL=postgres://localhost/snugknot_switch_test ADMIN_EMAIL=… ADMIN_PASSWORD=… AUTH_SECRET=… npm run build && npm start
 *   BASE_URL=http://localhost:3000 SNUGKNOT_DATABASE_URL=… ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/currency-switch-smoke.mjs
 */
import pg from 'pg'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const env = (k) => {
  const v = process.env[k]
  if (!v) {
    console.error(`Set ${k} (the same value the server uses).`)
    process.exit(2)
  }
  return v
}
if (/(^|\.)snugandknot\.com$/i.test(new URL(BASE).hostname)) {
  console.error('This test changes the shop\'s currency. Refusing to run against the production site.')
  process.exit(2)
}
const ADMIN_EMAIL = env('ADMIN_EMAIL')
const ADMIN_PASSWORD = env('ADMIN_PASSWORD')
const db = new pg.Pool({ connectionString: env('SNUGKNOT_DATABASE_URL') })
const sql = async (text, params) => (await db.query(text, params)).rows

let failures = 0
let passes = 0
function check(name, cond, detail) {
  if (cond) {
    passes++
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    console.log(`  ✗ ${name}${detail !== undefined ? `  →  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`)
  }
}

let cookie = ''
async function req(method, path, body, raw) {
  const headers = { Origin: BASE, 'X-Real-IP': '10.9.8.7' }
  if (cookie) headers.Cookie = cookie
  if (body !== undefined) headers['Content-Type'] = raw ? 'text/plain' : 'application/json'
  const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : raw ? body : JSON.stringify(body), redirect: 'manual' })
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';')
    if (/^(__Host-)?sk_session=/.test(pair)) cookie = pair.endsWith('=') ? '' : pair
  }
  const type = res.headers.get('content-type') || ''
  return { status: res.status, data: type.includes('json') ? await res.json() : await res.text() }
}

const RATE = 84
/** The server's whole-amount rounding: old × rate, to the nearest whole unit, at least 1. */
const whole = (n) => (n <= 0 ? 0 : Math.max(1, Math.round(n * RATE)))
const num = (v) => (v === null ? null : Number(v))

async function main() {
  console.log(`\nMain currency switch → ${BASE}\n`)
  const login = await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  check('admin signs in', login.status === 200, login.status)
  const commerce = (await req('GET', '/api/admin/settings')).data.settings.commerce
  check('the shop starts in USD (this test expects a fresh database)', commerce.currency === 'USD', commerce.currency)
  if (commerce.currency !== 'USD') return

  console.log('\nRefusals')
  check('relabelling the currency through the settings form is refused (400)', (await req('PUT', '/api/admin/settings', { section: 'commerce', value: { ...commerce, currency: 'INR' } })).status === 400)
  check('switching to the current currency is refused (400)', (await req('POST', '/api/admin/settings/currency', { code: 'USD', rate: 1 })).status === 400)
  check('no rate → 422', (await req('POST', '/api/admin/settings/currency', { code: 'INR' })).status === 422)
  check('a zero rate → 422', (await req('POST', '/api/admin/settings/currency', { code: 'INR', rate: 0 })).status === 422)
  check('an unknown currency → 422', (await req('POST', '/api/admin/settings/currency', { code: 'ZZZ', rate: 2 })).status === 422)
  check('an unknown rounding → 422', (await req('POST', '/api/admin/settings/currency', { code: 'INR', rate: 2, rounding: 'up' })).status === 422)
  check('text/plain body → 415', (await req('POST', '/api/admin/settings/currency', JSON.stringify({ code: 'INR', rate: 2 }), true)).status === 415)

  // A fixed coupon to see converted, beside the seeded percentage ones.
  const code = `SWITCH${Date.now().toString(36).toUpperCase()}`
  const coupon = await req('POST', '/api/admin/coupons', { code, type: 'fixed', value: 10, minPurchase: 60, description: 'switch test' })
  check('a fixed coupon to convert', coupon.status === 201, coupon.data)

  const products = await sql('SELECT id, price, compare_at_price, prices FROM products ORDER BY id')
  const variants = await sql('SELECT id, product_id, price, compare_at_price, prices FROM variants ORDER BY id')
  const coupons = await sql('SELECT code, type, value, min_purchase, amounts FROM coupons ORDER BY code')
  const orders = await sql('SELECT id, currency, total FROM orders ORDER BY id')

  console.log('\nSwitch USD → INR at 84, whole amounts')
  const sw = await req('POST', '/api/admin/settings/currency', { code: 'INR', rate: RATE, rounding: 'whole' })
  check('switch → 200', sw.status === 200, sw.data)
  check('…reports every product, size and coupon', sw.data?.result?.products === products.length && sw.data.result.variants === variants.length && sw.data.result.coupons === coupons.length, sw.data?.result)

  const after = (await req('GET', '/api/admin/settings')).data.settings.commerce
  check('main currency is INR, in Indian number format', after.currency === 'INR' && after.locale === 'en-IN', { currency: after.currency, locale: after.locale })
  check('shipping threshold and rates converted', after.freeShippingThreshold === whole(commerce.freeShippingThreshold) && after.standardShippingRate === whole(commerce.standardShippingRate) && after.expressShippingRate === whole(commerce.expressShippingRate), after)
  const usd = after.extraCurrencies.find((c) => c.code === 'USD')
  check('USD stays on as an extra currency with exactly its old figures', usd && usd.freeShippingThreshold === commerce.freeShippingThreshold && usd.standardShippingRate === commerce.standardShippingRate && usd.pointsPerUnit === commerce.pointsPerDollar, usd)
  check('points: the same points for the same value', Math.abs(after.pointsPerDollar - commerce.pointsPerDollar / RATE) < 0.0001, after.pointsPerDollar)

  const pAfter = new Map((await sql('SELECT id, price, compare_at_price, prices FROM products')).map((r) => [r.id, r]))
  let pricesOk = true
  let booksOk = true
  for (const p of products) {
    const a = pAfter.get(p.id)
    const wantPrice = whole(Number(p.price))
    const wantWas = p.compare_at_price === null ? null : whole(Number(p.compare_at_price)) > wantPrice ? whole(Number(p.compare_at_price)) : null
    if (Number(a.price) !== wantPrice || num(a.compare_at_price) !== wantWas) pricesOk = false
    if (!a.prices.USD || a.prices.USD.price !== Number(p.price) || a.prices.USD.compareAtPrice !== num(p.compare_at_price) || a.prices.INR) booksOk = false
  }
  check('every product price is the USD price × 84 (compare-at too)', pricesOk)
  check('…and keeps its exact USD price for USD shoppers', booksOk)

  const vAfter = new Map((await sql('SELECT id, price, compare_at_price, prices FROM variants')).map((r) => [r.id, r]))
  check('every size converted the same way', variants.every((v) => Number(vAfter.get(v.id).price) === whole(Number(v.price))))

  const cAfter = new Map((await sql('SELECT code, type, value, min_purchase, amounts FROM coupons')).map((r) => [r.code, r]))
  const fixed = cAfter.get(code)
  check('fixed coupon: $10 off over $60 → ₹840 off over ₹5,040', fixed && Number(fixed.value) === 840 && Number(fixed.min_purchase) === 5040, fixed)
  check('…and keeps $10 off over $60 for USD shoppers', fixed?.amounts?.USD?.value === 10 && fixed.amounts.USD.minPurchase === 60, fixed?.amounts)
  const pct = coupons.find((c) => c.type === 'percentage')
  if (pct) check('percentage coupon keeps its percentage', Number(cAfter.get(pct.code).value) === Number(pct.value))

  const oAfter = await sql('SELECT id, currency, total FROM orders ORDER BY id')
  check('past orders keep their currency and totals', JSON.stringify(oAfter) === JSON.stringify(orders))

  console.log('\nStorefront')
  const shop = (await req('GET', '/api/products')).data.products
  const first = products.find((p) => shop.some((s) => s.id === p.id))
  const listed = shop.find((s) => s.id === first.id)
  check('the shop lists prices in INR', listed && listed.price === whole(Number(first.price)), { listed: listed?.price, want: whole(Number(first.price)) })
  const v = variants.find((x) => x.product_id === first.id)
  const qInr = (await req('POST', '/api/cart/quote', { lines: [{ variantId: v.id, quantity: 1 }] })).data.quote
  check('a quote in the main currency is in INR', qInr?.currency === 'INR' && qInr.subtotal === whole(Number(v.price)), qInr)
  const qUsd = (await req('POST', '/api/cart/quote', { lines: [{ variantId: v.id, quantity: 1 }], currency: 'USD' })).data.quote
  check('a USD shopper still pays the old USD price', qUsd?.currency === 'USD' && qUsd.subtotal === Number(v.price), qUsd)

  check('switching to INR again is refused (400)', (await req('POST', '/api/admin/settings/currency', { code: 'INR', rate: 1 })).status === 400)
}

main()
  .catch((err) => {
    failures++
    console.error(err)
  })
  .finally(async () => {
    await db.end()
    console.log(`\n${passes} passed, ${failures} failed`)
    process.exit(failures ? 1 : 0)
  })
