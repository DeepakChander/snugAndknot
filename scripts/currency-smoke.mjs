#!/usr/bin/env node
/**
 * End-to-end test of selling in a second currency (INR next to the base USD): admin settings,
 * per-currency product prices, quotes, coupons, orders, points, returns and the dashboard.
 *
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/currency-smoke.mjs
 *
 * It writes rows (orders, a coupon, a customer) and edits one product's INR price, restoring the
 * settings and the price at the end. Use a development database, never production.
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (the same values the server uses).')
  process.exit(2)
}

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
const randomIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
const COOKIE_RE = /^(__Host-)?sk_session=/
class Client {
  constructor(ip = randomIp()) {
    this.ip = ip
    this.cookie = ''
  }
  async req(method, path, body) {
    const headers = { Origin: BASE, 'X-Real-IP': this.ip === 'rotate' ? randomIp() : this.ip }
    if (this.cookie) headers.Cookie = this.cookie
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' })
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';')
      if (COOKIE_RE.test(pair)) this.cookie = pair.endsWith('=') ? '' : pair
    }
    const data = (res.headers.get('content-type') || '').includes('json') ? await res.json() : await res.text()
    return { status: res.status, data }
  }
  get = (p) => this.req('GET', p)
  post = (p, b) => this.req('POST', p, b)
  put = (p, b) => this.req('PUT', p, b)
  patch = (p, b) => this.req('PATCH', p, b)
  del = (p) => this.req('DELETE', p)
}

const stamp = Date.now().toString(36)
const address = { firstName: 'Ada', lastName: 'Loom', line1: '1 Weaver Lane', city: 'Pune', state: 'MH', postalCode: '411001', country: 'India', phone: '+91 90000 00000' }
const INR = { code: 'INR', locale: 'en-IN', countries: ['IN'], standardShippingRate: 99, expressShippingRate: 299, freeShippingThreshold: 50000, pointsPerUnit: 0.01 }
const round2 = (n) => Math.round(n * 100) / 100

async function main() {
  console.log(`\nCurrency smoke test → ${BASE}\n`)
  const admin = new Client()
  const anon = new Client('rotate')
  const shopper = new Client()
  check('admin signs in', (await admin.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })).status === 200)
  const original = (await admin.get('/api/admin/settings')).data.settings.commerce
  const base = original.currency

  console.log('\nAdmin: currencies')
  const dup = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...original, extraCurrencies: [{ ...INR, code: base }] } })
  check('the base currency cannot be added again → 422', dup.status === 422, dup.data)
  const badCountry = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...original, extraCurrencies: [{ ...INR, countries: ['IND'] }] } })
  check('country codes must be 2 letters → 422', badCountry.status === 422, badCountry.status)
  const four = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...original, extraCurrencies: ['INR', 'EUR', 'GBP', 'AUD'].map((code) => ({ ...INR, code, countries: [] })) } })
  check('at most 3 additional currencies → 422', four.status === 422, four.status)
  const saved = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...original, extraCurrencies: [INR] } })
  check('INR added', saved.status === 200 && saved.data.value.extraCurrencies?.[0]?.code === 'INR', saved.data)

  const products = (await anon.get('/api/products')).data.products
  const withStock = products.filter((p) => p.variants.some((v) => v.inventory >= 3))
  const [pA, pB] = withStock
  const vA = pA.variants.find((v) => v.inventory >= 3)
  const vB = pB.variants.find((v) => v.inventory >= 3)
  const adminA = (await admin.get(`/api/admin/products/${pA.id}`)).data.product
  check('admin can read product A', !!adminA?.id, adminA)
  const priceA = await admin.put(`/api/admin/products/${pA.id}`, { ...adminA, prices: { INR: { price: 11999, compareAtPrice: 14999 } } })
  check('admin sets an INR price on product A', priceA.status === 200 && priceA.data.product.prices?.INR?.price === 11999, priceA.data)
  const badPrice = await admin.put(`/api/admin/products/${pA.id}`, { ...adminA, prices: { inr1: { price: 1, compareAtPrice: null } } })
  check('price book keys must be currency codes → 422', badPrice.status === 422, badPrice.status)
  const listed = (await anon.get('/api/products')).data.products.find((p) => p.id === pA.id)
  check('storefront product data carries the INR price', listed?.prices?.INR?.price === 11999, listed?.prices)
  check('…and product B has none', !Object.keys((await anon.get('/api/products')).data.products.find((p) => p.id === pB.id)?.prices ?? {}).length)

  console.log('\nQuotes')
  const qInr = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], currency: 'INR' })).data.quote
  check('INR quote uses the INR price', qInr.currency === 'INR' && qInr.lines[0]?.price === 11999 && qInr.subtotal === 11999, qInr)
  check('INR quote uses INR shipping', qInr.shipping === 99 && qInr.total === round2(11999 + 99 + (11999 * original.taxRate) / 100), qInr)
  check('INR free-shipping remaining is in INR', qInr.freeShippingRemaining === 50000 - 11999, qInr.freeShippingRemaining)
  const qBase = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }] })).data.quote
  check('no currency → the base currency, base price', qBase.currency === base && qBase.lines[0]?.price === vA.price, qBase)
  const qUnknown = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], currency: 'JPY' })).data.quote
  check('a currency the shop does not sell in → base currency', qUnknown.currency === base, qUnknown.currency)
  const qB = (await anon.post('/api/cart/quote', { lines: [{ variantId: vB.id, quantity: 1 }], currency: 'INR' })).data.quote
  check('a piece with no INR price is dropped with a reason', qB.lines.length === 0 && /not sold in INR/.test(qB.issues[0] ?? ''), qB)

  console.log('\nCoupons')
  const code = `INR${stamp}`.toUpperCase().slice(0, 20)
  await admin.post('/api/admin/coupons', { code, type: 'fixed', value: 5, minPurchase: 0, description: 'currency smoke', expiresAt: null, active: true, usageLimit: null })
  const qFixedNo = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], currency: 'INR', couponCode: code })).data.quote
  check('a fixed code without an INR amount is refused in INR', qFixedNo.discount === 0 && /cannot be used for orders in INR/.test(qFixedNo.couponError ?? ''), qFixedNo.couponError)
  const qFixedBase = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], couponCode: code })).data.quote
  check('…but works in the base currency', qFixedBase.discount === 5, qFixedBase.discount)
  const upd = await admin.put(`/api/admin/coupons/${code}`, { code, type: 'fixed', value: 5, minPurchase: 0, description: 'currency smoke', expiresAt: null, active: true, usageLimit: null, amounts: { INR: { value: 400, minPurchase: 20000 } } })
  check('admin sets an INR amount and minimum', upd.status === 200 && upd.data.coupon.amounts?.INR?.value === 400, upd.data)
  const qMin = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], currency: 'INR', couponCode: code })).data.quote
  check('the INR minimum spend applies', qMin.discount === 0 && /Spend 20000/.test(qMin.couponError ?? ''), qMin.couponError)
  const qTwo = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 2 }], currency: 'INR', couponCode: code })).data.quote
  check('…and once met, ₹400 comes off', qTwo.discount === 400, qTwo)
  const qPct = (await anon.post('/api/cart/quote', { lines: [{ variantId: vA.id, quantity: 1 }], currency: 'INR', couponCode: 'WELCOME10' })).data.quote
  check('a percentage code works in INR', qPct.discount === round2(11999 * 0.1), qPct)
  await admin.del(`/api/admin/coupons/${code}`)

  console.log('\nOrders in INR')
  const email = `inr-${stamp}@example.com`
  await shopper.post('/api/auth/signup', { name: 'Ada Loom', email, password: 'knit-and-purl-9' })
  const pointsBefore = (await shopper.get('/api/auth/me')).data.user.points
  const order = await shopper.post('/api/orders', { lines: [{ variantId: vA.id, quantity: 1 }], shippingMethod: 'express', email, address, paymentMethod: 'cod', currency: 'INR' })
  const o = order.data.order
  check('COD order placed in INR', order.status === 201 && o.currency === 'INR' && o.subtotal === 11999 && o.shipping === 299, order.data)
  check('points use the INR rate (0.01 per rupee), given on delivery', o.pointsEarned === Math.floor(o.total * 0.01) && !o.pointsGranted && (await shopper.get('/api/auth/me')).data.user.points === pointsBefore, { earned: o.pointsEarned })
  const eur = await anon.post('/api/orders', { lines: [{ variantId: vA.id, quantity: 1 }], shippingMethod: 'standard', email: `eur-${stamp}@example.com`, address, paymentMethod: 'cod', currency: 'EUR' })
  check('an order in a currency the shop does not sell in → 400', eur.status === 400, eur.data)
  const noInr = await anon.post('/api/orders', { lines: [{ variantId: vB.id, quantity: 1 }], shippingMethod: 'standard', email: `noinr-${stamp}@example.com`, address, paymentMethod: 'cod', currency: 'INR' })
  check('ordering a piece with no INR price in INR is refused', noInr.status >= 400 && noInr.status < 500, noInr.status)
  const adminOrder = (await admin.get(`/api/admin/orders/${o.id}`)).data.order
  check('admin sees the order currency', adminOrder.currency === 'INR', adminOrder.currency)
  const usd = await anon.post('/api/orders', { lines: [{ variantId: vA.id, quantity: 1 }], shippingMethod: 'standard', email: `usd-${stamp}@example.com`, address, paymentMethod: 'cod' })
  check('an order without a currency is in the base currency', usd.data.order?.currency === base && usd.data.order.subtotal === vA.price, usd.data)

  console.log('\nReturns and reports')
  await admin.patch(`/api/admin/orders/${o.id}`, { status: 'delivered' })
  check('INR points arrive when the order is delivered', (await shopper.get('/api/auth/me')).data.user.points === pointsBefore + o.pointsEarned)
  const full = (await shopper.get(`/api/orders/${o.id}`)).data.order
  const ret = await shopper.post('/api/returns', { orderId: o.id, items: [{ orderItemId: full.items[0].id, quantity: 1 }], reason: 'wrong-size', comments: null })
  check('return refund is in INR', ret.status === 201 && ret.data.return?.currency === 'INR' && ret.data.return.refundAmount === 11999, ret.data)
  const stats = (await admin.get('/api/admin/stats')).data.stats
  const inrLine = stats.otherCurrencies?.find((c) => c.currency === 'INR')
  check('dashboard reports INR revenue separately', inrLine && inrLine.revenue >= o.total && inrLine.orders >= 1, stats.otherCurrencies)
  const customers = (await admin.get('/api/admin/customers')).data.customers
  const me = customers.find((c) => c.email === email)
  check('customer spend is kept per currency', me && me.spent.some((s) => s.currency === 'INR' && s.amount === o.total), me?.spent)
  const geo = await anon.get('/api/geo')
  check('geo endpoint answers without Vercel (ZZ = unknown)', geo.status === 200 && /^[A-Z]{2}$/.test(geo.data.country), geo.data)

  console.log('\nRestore')
  await admin.put(`/api/admin/products/${pA.id}`, { ...adminA, prices: adminA.prices ?? {} })
  await admin.put('/api/admin/settings', { section: 'commerce', value: original })
  const restored = (await admin.get('/api/admin/settings')).data.settings.commerce
  check('commerce settings restored', JSON.stringify(restored) === JSON.stringify(original))
}

main()
  .catch((err) => {
    console.error(err)
    failures++
  })
  .finally(() => {
    console.log(`\n${passes} passed, ${failures} failed`)
    process.exit(failures ? 1 : 0)
  })
