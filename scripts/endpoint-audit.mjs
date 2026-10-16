#!/usr/bin/env node
/**
 * Per-endpoint access and input audit for the Snug&Knot API: every route handler under
 * src/app/api, every exported method, every role (signed out, customer, another customer, admin),
 * plus the proxy and the admin / account page guards.
 *
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/endpoint-audit.mjs
 *
 * The payment routes and the Razorpay webhook are exercised end to end only when the server was
 * started with the SNUGKNOT_RAZORPAY_* variables (see scripts/razorpay-smoke.mjs) and the same
 * values are set here; this script then runs its own stand-in for the Razorpay API on
 * SNUGKNOT_RAZORPAY_API_BASE. Without them those happy paths are reported as not exercised.
 *
 * It writes rows (customers, orders, a review, a product, a coupon …) and removes or cancels what it
 * can. Use a development database, never production. At the end it prints a route × method table and
 * lists any route handler found on disk that it did not exercise.
 */
import { createHmac, randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (the same values the server uses).')
  process.exit(2)
}
if (/(^|\.)snugandknot\.com$/i.test(new URL(BASE).hostname)) {
  console.error('This audit writes rows. Refusing to run against the production site.')
  process.exit(2)
}
const RZP = {
  keyId: process.env.SNUGKNOT_RAZORPAY_KEY_ID,
  keySecret: process.env.SNUGKNOT_RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.SNUGKNOT_RAZORPAY_WEBHOOK_SECRET,
  apiBase: process.env.SNUGKNOT_RAZORPAY_API_BASE,
}
const RZP_ON = !!(RZP.keyId && RZP.keySecret && RZP.webhookSecret && RZP.apiBase && /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(RZP.apiBase))

/* ───────────── Results, per endpoint ───────────── */

let failures = 0
let passes = 0
/** "METHOD /api/route/[param]" → { roles, pass, fail } */
const matrix = new Map()
const failed = []
function entry(key) {
  if (!matrix.has(key)) matrix.set(key, { roles: new Set(), pass: 0, fail: 0 })
  return matrix.get(key)
}
/** Records one assertion against an endpoint, for one role (anon, customer, other, admin). */
function check(key, role, name, cond, detail) {
  const e = entry(key)
  e.roles.add(role)
  if (cond) {
    passes++
    e.pass++
    console.log(`  ✓ [${role}] ${key} — ${name}`)
  } else {
    failures++
    e.fail++
    const d = detail !== undefined ? `  →  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''
    failed.push(`[${role}] ${key} — ${name}${d}`)
    console.log(`  ✗ [${role}] ${key} — ${name}${d}`)
  }
}
/** Shorthand: the response has `status` (and `more` holds). Prints status + body on failure. */
function expect(key, role, name, res, status, more = true) {
  check(key, role, `${name} → ${status}`, res.status === status && !!more, { status: res.status, body: brief(res.data) })
}
const brief = (d) => {
  const s = typeof d === 'string' ? d : d instanceof ArrayBuffer ? `<${d.byteLength} bytes>` : JSON.stringify(d)
  return s && s.length > 300 ? `${s.slice(0, 300)}…` : s
}
const notExercised = []

/* ───────────── HTTP client ───────────── */

const randomIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
const COOKIE_RE = /^(__Host-)?sk_session=/
let cookieName = 'sk_session'

class Client {
  /** ip: a fixed address for this client, or 'rotate' for a new one per request (per-IP limits). */
  constructor(role, ip = randomIp()) {
    this.role = role
    this.ip = ip
    this.cookie = ''
  }
  /**
   * body: an object (sent as JSON), a FormData, or a string (sent as-is; set Content-Type in headers).
   * headers: extra headers; a null value removes a default (e.g. { Origin: null }).
   */
  async req(method, path, body, headers = {}) {
    const h = { Origin: BASE, 'X-Real-IP': this.ip === 'rotate' ? randomIp() : this.ip }
    if (this.cookie) h.Cookie = this.cookie
    let payload
    if (body instanceof FormData) payload = body
    else if (typeof body === 'string') {
      h['Content-Type'] = 'text/plain'
      payload = body
    } else if (body !== undefined) {
      h['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    for (const [k, v] of Object.entries(headers)) {
      if (v === null) delete h[k]
      else h[k] = v
    }
    const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect: 'manual' })
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';')
      if (COOKIE_RE.test(pair)) {
        cookieName = pair.split('=')[0]
        this.cookie = pair.endsWith('=') ? '' : pair
      }
    }
    const type = res.headers.get('content-type') || ''
    const data = type.includes('json') ? await res.json().catch(() => null) : type.startsWith('text/') ? await res.text() : await res.arrayBuffer()
    return { status: res.status, data, headers: res.headers }
  }
  get = (p, h) => this.req('GET', p, undefined, h)
  post = (p, b, h) => this.req('POST', p, b, h)
  put = (p, b, h) => this.req('PUT', p, b, h)
  patch = (p, b, h) => this.req('PATCH', p, b, h)
  del = (p, h) => this.req('DELETE', p, undefined, h)
}

const EVIL = { Origin: 'https://evil.example' }
const stamp = Date.now().toString(36)
const address = { firstName: 'Ada', lastName: 'Loom', line1: '1 Weaver Lane', city: 'Brooklyn', state: 'NY', postalCode: '11201', country: 'United States', phone: '+1 555 0100' }
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const MISSING = `zz_missing_${stamp}`

const anon = new Client('anon', 'rotate')
const shopper = new Client('customer')
const other = new Client('other')
const admin = new Client('admin')
const shopperEmail = `audit-${stamp}@example.com`
const otherEmail = `audit-other-${stamp}@example.com`
const SHOPPER_PW = 'audit-knit-and-purl-9'
const OTHER_PW = 'audit-purl-and-knit-7'

/** Orders this run created, cancelled at the end so stock goes back. */
const createdOrders = new Set()

/* ───────────── Razorpay stand-in (only with RZP_ON) ───────────── */

const rzp = { orders: new Map(), payments: new Map() }
const rid = (p) => `${p}_${randomBytes(7).toString('hex')}`
let mock = null
function startMock() {
  const base = new URL(RZP.apiBase)
  const expectedAuth = `Basic ${Buffer.from(`${RZP.keyId}:${RZP.keySecret}`).toString('base64')}`
  mock = createServer(async (req, res) => {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    }
    const path = req.url.replace(base.pathname.replace(/\/$/, ''), '')
    if (req.headers.authorization !== expectedAuth) return send(401, { error: { description: 'Authentication failed' } })
    let m
    if (req.method === 'POST' && path === '/orders') {
      const o = { id: rid('order'), entity: 'order', amount: body.amount, currency: body.currency, receipt: body.receipt, status: 'created' }
      rzp.orders.set(o.id, o)
      return send(200, o)
    }
    if (req.method === 'GET' && (m = path.match(/^\/orders\/([^/]+)\/payments$/))) {
      return send(200, { entity: 'collection', items: [...rzp.payments.values()].filter((p) => p.order_id === m[1]) })
    }
    if (req.method === 'GET' && (m = path.match(/^\/payments\/([^/]+)$/))) {
      const p = rzp.payments.get(m[1])
      return p ? send(200, p) : send(404, { error: { description: 'not found' } })
    }
    if (req.method === 'POST' && (m = path.match(/^\/payments\/([^/]+)\/capture$/))) {
      const p = rzp.payments.get(m[1])
      if (!p) return send(404, { error: { description: 'not found' } })
      p.status = 'captured'
      return send(200, p)
    }
    send(404, { error: { description: `no mock for ${req.method} ${path}` } })
  })
  return new Promise((r) => mock.listen(Number(base.port), base.hostname, r))
}
function pay(razorpayOrderId, status = 'captured') {
  const o = rzp.orders.get(razorpayOrderId)
  const p = { id: rid('pay'), entity: 'payment', order_id: razorpayOrderId, amount: o.amount, currency: o.currency, status, amount_refunded: 0, method: 'card' }
  rzp.payments.set(p.id, p)
  const signature = createHmac('sha256', RZP.keySecret).update(`${razorpayOrderId}|${p.id}`).digest('hex')
  return { payment: p, proof: { razorpayOrderId, razorpayPaymentId: p.id, razorpaySignature: signature } }
}
const postWebhook = (raw, sig, headers = {}) =>
  fetch(`${BASE}/api/webhooks/razorpay`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': sig, ...headers }, body: raw }).then(async (r) => ({
    status: r.status,
    data: await r.json().catch(() => null),
  }))
const signWebhook = (raw) => createHmac('sha256', RZP.webhookSecret).update(raw).digest('hex')

/* ───────────── The audit ───────────── */

let ctx = {}

async function main() {
  console.log(`\nSnug&Knot endpoint audit → ${BASE}${RZP_ON ? ' (with Razorpay stand-in)' : ''}\n`)
  if (RZP_ON) await startMock()
  await setup()
  await proxyAndAdminGuards()
  await publicCatalogue()
  await authRoutes()
  await accountRoutes()
  await cartAndCheckout()
  await reviewsAndReturns()
  await inboxRoutes()
  await paymentRoutes()
  await adminCatalogue()
  await adminOperations()
  await adminSettingsAndMisc()
  await pageGuards()
  await methodsAndHeaders()
  await sessionEnd()
  await cleanup()
}

async function setup() {
  console.log('Setup')
  const login = await admin.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  expect('POST /api/auth/login', 'admin', 'env admin signs in', login, 200, login.data?.user?.role === 'admin')
  ctx.adminId = login.data?.user?.id
  const s = await shopper.post('/api/auth/signup', { name: 'Audit Shopper', email: shopperEmail, password: SHOPPER_PW })
  expect('POST /api/auth/signup', 'anon', 'new customer signs up (session cookie set)', s, 201, !!shopper.cookie && s.data?.user?.role === 'customer')
  ctx.shopperId = s.data?.user?.id
  const o = await other.post('/api/auth/signup', { name: 'Audit Other', email: otherEmail, password: OTHER_PW })
  expect('POST /api/auth/signup', 'anon', 'second customer signs up', o, 201, !!other.cookie)
  ctx.otherId = o.data?.user?.id

  const list = await anon.get('/api/products')
  const products = list.data?.products ?? []
  ctx.products = products
  ctx.product = products[0]
  const pool = products.flatMap((p) => p.variants.filter((v) => v.inventory >= 3).map((v) => ({ ...v, productId: p.id, handle: p.handle })))
  ctx.pool = pool
  if (pool.length < 4) throw new Error(`Need at least 4 variants with stock ≥ 3, found ${pool.length}`)
  ctx.v = pool[0]
}

/* ── Proxy + every admin API: signed out → 401, customer → 403, before any handler runs ── */

const ADMIN_ENDPOINTS = [
  ['GET', '/api/admin/categories', '/api/admin/categories'],
  ['POST', '/api/admin/categories', '/api/admin/categories'],
  ['PUT', '/api/admin/categories/[slug]', `/api/admin/categories/${MISSING}`],
  ['DELETE', '/api/admin/categories/[slug]', `/api/admin/categories/${MISSING}`],
  ['GET', '/api/admin/collections', '/api/admin/collections'],
  ['POST', '/api/admin/collections', '/api/admin/collections'],
  ['PUT', '/api/admin/collections/[id]', `/api/admin/collections/${MISSING}`],
  ['DELETE', '/api/admin/collections/[id]', `/api/admin/collections/${MISSING}`],
  ['GET', '/api/admin/coupons', '/api/admin/coupons'],
  ['POST', '/api/admin/coupons', '/api/admin/coupons'],
  ['PUT', '/api/admin/coupons/[code]', `/api/admin/coupons/${MISSING}`],
  ['DELETE', '/api/admin/coupons/[code]', `/api/admin/coupons/${MISSING}`],
  ['GET', '/api/admin/customers', '/api/admin/customers'],
  ['PATCH', '/api/admin/customers/[id]', `/api/admin/customers/${MISSING}`],
  ['GET', '/api/admin/media', '/api/admin/media'],
  ['POST', '/api/admin/media', '/api/admin/media'],
  ['DELETE', '/api/admin/media/[id]', `/api/admin/media/${MISSING}`],
  ['GET', '/api/admin/messages', '/api/admin/messages'],
  ['PATCH', '/api/admin/messages/[id]', `/api/admin/messages/${MISSING}`],
  ['DELETE', '/api/admin/messages/[id]', `/api/admin/messages/${MISSING}`],
  ['POST', '/api/admin/notifications/test', '/api/admin/notifications/test'],
  ['GET', '/api/admin/orders', '/api/admin/orders'],
  ['GET', '/api/admin/orders/[id]', `/api/admin/orders/${MISSING}`],
  ['PATCH', '/api/admin/orders/[id]', `/api/admin/orders/${MISSING}`],
  ['GET', '/api/admin/products', '/api/admin/products'],
  ['POST', '/api/admin/products', '/api/admin/products'],
  ['GET', '/api/admin/products/[id]', `/api/admin/products/${MISSING}`],
  ['PUT', '/api/admin/products/[id]', `/api/admin/products/${MISSING}`],
  ['DELETE', '/api/admin/products/[id]', `/api/admin/products/${MISSING}`],
  ['POST', '/api/admin/products/actions', '/api/admin/products/actions'],
  ['GET', '/api/admin/returns', '/api/admin/returns'],
  ['PATCH', '/api/admin/returns/[id]', `/api/admin/returns/${MISSING}`],
  ['GET', '/api/admin/reviews', '/api/admin/reviews'],
  ['PATCH', '/api/admin/reviews/[id]', `/api/admin/reviews/${MISSING}`],
  ['DELETE', '/api/admin/reviews/[id]', `/api/admin/reviews/${MISSING}`],
  ['GET', '/api/admin/settings', '/api/admin/settings'],
  ['PUT', '/api/admin/settings', '/api/admin/settings'],
  ['POST', '/api/admin/settings/currency', '/api/admin/settings/currency'],
  ['GET', '/api/admin/stats', '/api/admin/stats'],
  ['GET', '/api/admin/stock-alerts', '/api/admin/stock-alerts'],
  ['GET', '/api/admin/subscribers', '/api/admin/subscribers'],
  ['DELETE', '/api/admin/subscribers', `/api/admin/subscribers?email=${encodeURIComponent(`nobody-${stamp}@example.com`)}`],
]

async function proxyAndAdminGuards() {
  console.log('\nAdmin API guards (proxy + handler), every admin route × method')
  const forged = new Client('forged')
  forged.cookie = `${cookieName}=eyJzdWIiOiJ4Iiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJ2IjowfQ.AAAA`
  for (const [method, route, path] of ADMIN_ENDPOINTS) {
    const key = `${method} ${route}`
    const body = method === 'GET' || method === 'DELETE' ? undefined : {}
    const a = await anon.req(method, path, body)
    check(key, 'anon', 'signed out → 401, no data', a.status === 401 && typeof a.data?.error === 'string' && Object.keys(a.data).length <= 2, { status: a.status, body: brief(a.data) })
    const c = await shopper.req(method, path, body)
    check(key, 'customer', 'customer → 403', c.status === 403, { status: c.status, body: brief(c.data) })
    const f = await forged.req(method, path, body)
    check(key, 'forged', 'forged admin cookie → 401', f.status === 401, { status: f.status })
    if (method !== 'GET') {
      const x = await admin.req(method, path, body, EVIL)
      check(key, 'admin', 'admin, cross-site Origin → 403', x.status === 403, { status: x.status, body: brief(x.data) })
      const n = await admin.req(method, path, body, { Origin: 'null' })
      check(key, 'admin', 'admin, Origin: null → 403', n.status === 403, { status: n.status })
    }
    if (method === 'GET') check(key, 'anon', 'refusal is not cacheable', a.headers.get('cache-control') === 'no-store', a.headers.get('cache-control'))
  }
}

/* ── Public catalogue: products, geo, media, product reviews (GET) ── */

async function publicCatalogue() {
  console.log('\nPublic catalogue')
  const K = 'GET /api/products'
  const all = await anon.get('/api/products')
  expect(K, 'anon', 'list products', all, 200, Array.isArray(all.data?.products) && all.data.products.length > 0 && all.data.products.every((p) => p.id && p.handle && Array.isArray(p.variants)))
  const q = await anon.get(`/api/products?q=${encodeURIComponent(ctx.product.title.split(' ')[0])}&limit=2&sort=price-asc&gender=bogus`)
  expect(K, 'anon', 'search + limit + sort, unknown gender ignored', q, 200, q.data?.products?.length <= 2)
  const lim = await anon.get('/api/products?limit=-5&sort=%27;drop')
  expect(K, 'anon', 'nonsense limit/sort ignored', lim, 200, Array.isArray(lim.data?.products))
  const c = await shopper.get('/api/products')
  expect(K, 'customer', 'same catalogue for a customer', c, 200, c.data?.products?.length === all.data.products.length)
  const drafts = await admin.get('/api/products')
  expect(K, 'admin', 'admin sees only the public catalogue here (no drafts)', drafts, 200, drafts.data?.products?.every((p) => p.status === undefined || p.status === 'active'))

  const G = 'GET /api/geo'
  const g = await anon.get('/api/geo')
  expect(G, 'anon', 'no platform header → ZZ', g, 200, g.data?.country === 'ZZ' && /no-store/.test(g.headers.get('cache-control') ?? ''))
  const gi = await anon.get('/api/geo', { 'x-vercel-ip-country': 'in' })
  expect(G, 'anon', 'platform header → upper-cased country', gi, 200, gi.data?.country === 'IN')
  const gb = await anon.get('/api/geo', { 'x-vercel-ip-country': '<script>' })
  expect(G, 'anon', 'malformed header → ZZ', gb, 200, gb.data?.country === 'ZZ')

  const M = 'GET /api/media/[id]'
  const m1 = await anon.get('/api/media/not-an-id')
  expect(M, 'anon', 'malformed id', m1, 404)
  const m2 = await anon.get(`/api/media/img_${'0'.repeat(20)}`)
  expect(M, 'anon', 'well-formed unknown id', m2, 404)
  const m3 = await anon.get('/api/media/..%2F..%2Fetc%2Fpasswd')
  expect(M, 'anon', 'path traversal attempt', m3, 404)

  const R = 'GET /api/products/[handle]/reviews'
  const r = await anon.get(`/api/products/${ctx.v.handle}/reviews`)
  expect(R, 'anon', 'reviews + summary, mine = null', r, 200, Array.isArray(r.data?.reviews) && typeof r.data?.summary?.count === 'number' && r.data.mine === null)
  const rc = await shopper.get(`/api/products/${ctx.v.handle}/reviews`)
  expect(R, 'customer', 'signed in, no review yet → mine = null', rc, 200, rc.data?.mine === null)
  const rn = await anon.get(`/api/products/${MISSING}/reviews`)
  expect(R, 'anon', 'unknown product', rn, 404)
}

/* ── Auth ── */

async function authRoutes() {
  console.log('\nAuth')
  const S = 'POST /api/auth/signup'
  {
  const dup = await anon.post('/api/auth/signup', { name: 'Dup', email: shopperEmail, password: 'another-pass-77' })
  expect(S, 'anon', 'existing email', dup, 409)
  const owner = await anon.post('/api/auth/signup', { name: 'Owner?', email: ADMIN_EMAIL, password: 'claiming-it-first-1' })
  expect(S, 'anon', 'the ADMIN_EMAIL address cannot be registered', owner, 409)
  const bad = await anon.post('/api/auth/signup', { name: '', email: 'nope', password: '1' })
  expect(S, 'anon', 'invalid input', bad, 422, bad.data?.fields?.email && bad.data?.fields?.password)
  const sameAsEmail = await anon.post('/api/auth/signup', { name: 'X', email: `same-${stamp}@example.com`, password: `same-${stamp}` })
  expect(S, 'anon', 'password = email local part', sameAsEmail, 422)
  const plain = await anon.post('/api/auth/signup', JSON.stringify({ name: 'P', email: `p-${stamp}@example.com`, password: 'plain-text-99' }))
  expect(S, 'anon', 'text/plain body', plain, 415)
  const notJson = await anon.post('/api/auth/signup', '{not json', { 'Content-Type': 'application/json' })
  expect(S, 'anon', 'malformed JSON', notJson, 400)
  const xs = await anon.post('/api/auth/signup', { name: 'X', email: `x-${stamp}@example.com`, password: 'cross-site-99' }, EVIL)
  expect(S, 'anon', 'cross-site Origin', xs, 403)
  const sfs = await anon.post('/api/auth/signup', { name: 'X', email: `y-${stamp}@example.com`, password: 'cross-site-99' }, { 'Sec-Fetch-Site': 'cross-site' })
  expect(S, 'anon', 'Sec-Fetch-Site: cross-site', sfs, 403)
  const xsCheck = await admin.get(`/api/admin/customers`)
  check(S, 'admin', 'refused cross-site signups created no account', !xsCheck.data?.customers?.some((u) => u.email === `x-${stamp}@example.com` || u.email === `y-${stamp}@example.com`))

  }
  const L = 'POST /api/auth/login'
  let c
  {
  c = new Client('customer')
  const ok = await c.post('/api/auth/login', { email: shopperEmail.toUpperCase(), password: SHOPPER_PW })
  expect(L, 'customer', 'customer signs in (email case-insensitive)', ok, 200, ok.data?.user?.email === shopperEmail && !!c.cookie && !('passwordHash' in (ok.data?.user ?? {})))
  const wrong = await anon.post('/api/auth/login', { email: shopperEmail, password: 'wrong-password-1' })
  expect(L, 'anon', 'wrong password', wrong, 401)
  const ghost = await anon.post('/api/auth/login', { email: `ghost-${stamp}@example.com`, password: 'wrong-password-1' })
  check(L, 'anon', 'unknown email → same 401 and message as a wrong password', ghost.status === 401 && ghost.data?.error === wrong.data?.error, ghost.data)
  const adminWrong = await anon.post('/api/auth/login', { email: ADMIN_EMAIL, password: 'not-the-admin-pw-1' })
  expect(L, 'anon', 'admin email with wrong password', adminWrong, 401)
  const badLogin = await anon.post('/api/auth/login', { email: 'x', password: '' })
  expect(L, 'anon', 'invalid input', badLogin, 422)
  const plain = await anon.post('/api/auth/login', JSON.stringify({ email: shopperEmail, password: SHOPPER_PW }))
  expect(L, 'anon', 'text/plain body', plain, 415)
  const xs = await new Client('anon').post('/api/auth/login', { email: shopperEmail, password: SHOPPER_PW }, EVIL)
  expect(L, 'anon', 'cross-site Origin (no session issued)', xs, 403, !xs.headers.get('set-cookie'))
  ctx.secondShopperSession = c
  }

  const ME = 'GET /api/auth/me'
  const ma = await anon.get('/api/auth/me')
  expect(ME, 'anon', 'signed out → user null', ma, 200, ma.data?.user === null && ma.headers.get('cache-control') === 'no-store')
  const mc = await shopper.get('/api/auth/me')
  expect(ME, 'customer', 'signed in → own user, no secrets', mc, 200, mc.data?.user?.email === shopperEmail && !JSON.stringify(mc.data).match(/password|hash|session_version/i))
  const mad = await admin.get('/api/auth/me')
  expect(ME, 'admin', 'admin → role admin', mad, 200, mad.data?.user?.role === 'admin')
  const forged = await anon.get('/api/auth/me', { Cookie: `${cookieName}=eyJzdWIiOiJ4Iiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJ2IjowfQ.AAAA` })
  expect(ME, 'forged', 'forged cookie → user null', forged, 200, forged.data?.user === null)

  const LO = 'POST /api/auth/logout'
  const xs2 = await c.post('/api/auth/logout', undefined, EVIL)
  expect(LO, 'customer', 'cross-site Origin', xs2, 403)
  check(LO, 'customer', '…and the session survives it', (await c.get('/api/auth/me')).data?.user?.email === shopperEmail)
  const out = await c.post('/api/auth/logout')
  expect(LO, 'customer', 'customer signs out, cookie cleared', out, 200, !c.cookie)
  const outAnon = await anon.post('/api/auth/logout')
  expect(LO, 'anon', 'signing out while signed out is harmless', outAnon, 200)
}

/* ── Account ── */

async function accountRoutes() {
  console.log('\nAccount')
  const A = 'PATCH /api/account'
  expect(A, 'anon', 'signed out', await anon.patch('/api/account', { name: 'Nobody' }), 401)
  const ok = await shopper.patch('/api/account', { name: 'Audit Shopper', phone: '+1 555 0101' })
  expect(A, 'customer', 'update own profile', ok, 200, ok.data?.user?.name === 'Audit Shopper' && ok.data.user.phone === '+1 555 0101' && ok.data.user.id === ctx.shopperId)
  const role = await shopper.patch('/api/account', { name: 'Audit Shopper', role: 'admin', points: 999999 })
  check(A, 'customer', 'extra fields (role, points) ignored', role.status === 200 && role.data?.user?.role === 'customer' && role.data.user.points !== 999999, role.data)
  expect(A, 'customer', 'invalid input (empty name)', await shopper.patch('/api/account', { name: '' }), 422)
  expect(A, 'customer', 'text/plain body', await shopper.patch('/api/account', JSON.stringify({ name: 'X' })), 415)
  const xs = await shopper.patch('/api/account', { name: 'Hijacked' }, EVIL)
  expect(A, 'customer', 'cross-site Origin', xs, 403)
  check(A, 'customer', '…and the name was not changed', (await shopper.get('/api/auth/me')).data?.user?.name === 'Audit Shopper')
  const ad = await admin.patch('/api/account', { name: 'Store Owner' })
  expect(A, 'admin', 'admin can edit their own profile', ad, 200, ad.data?.user?.role === 'admin')

  const P = 'POST /api/account/password'
  expect(P, 'anon', 'signed out', await anon.post('/api/account/password', { currentPassword: 'x', newPassword: 'new-password-123' }), 401)
  expect(P, 'other', 'wrong current password', await other.post('/api/account/password', { currentPassword: 'not-it-at-all', newPassword: 'brand-new-pass-1' }), 400)
  expect(P, 'other', 'same as current', await other.post('/api/account/password', { currentPassword: OTHER_PW, newPassword: OTHER_PW }), 422)
  expect(P, 'other', 'weak new password', await other.post('/api/account/password', { currentPassword: OTHER_PW, newPassword: 'password123' }), 422)
  expect(P, 'other', 'text/plain body', await other.post('/api/account/password', JSON.stringify({ currentPassword: OTHER_PW, newPassword: 'brand-new-pass-1' })), 415)
  expect(P, 'other', 'cross-site Origin', await other.post('/api/account/password', { currentPassword: OTHER_PW, newPassword: 'brand-new-pass-1' }, EVIL), 403)
  const oldCookie = other.cookie
  const changed = await other.post('/api/account/password', { currentPassword: OTHER_PW, newPassword: 'brand-new-pass-1' })
  expect(P, 'other', 'change password, this device stays signed in', changed, 200, (await other.get('/api/auth/me')).data?.user?.email === otherEmail)
  check(P, 'other', 'the previous cookie no longer works', (await anon.get('/api/auth/me', { Cookie: oldCookie })).data?.user === null)
  ctx.otherPw = 'brand-new-pass-1'
  const env = await admin.post('/api/account/password', { currentPassword: ADMIN_PASSWORD, newPassword: 'owner-new-pass-1' })
  expect(P, 'admin', 'env-managed admin password cannot be changed here', env, 400)
}

/* ── Cart, checkout, orders ── */

const orderBody = (variant, extra = {}) => ({ lines: [{ variantId: variant.id, quantity: 1 }], shippingMethod: 'standard', email: `audit-guest-${stamp}-${Math.random().toString(36).slice(2, 7)}@example.com`, address, paymentMethod: 'cod', ...extra })

async function cartAndCheckout() {
  console.log('\nCart, checkout and orders')
  const Q = 'POST /api/cart/quote'
  const q = await anon.post('/api/cart/quote', { lines: [{ variantId: ctx.v.id, quantity: 2 }] })
  expect(Q, 'anon', 'quote priced from the database', q, 200, q.data?.quote?.subtotal === Math.round(ctx.v.price * 2 * 100) / 100)
  const qc = await shopper.post('/api/cart/quote', { lines: [{ variantId: ctx.v.id, quantity: 1 }], couponCode: 'welcome10', shippingMethod: 'express' })
  expect(Q, 'customer', 'quote with a coupon', qc, 200, qc.data?.quote?.discount > 0)
  const qx = await anon.post('/api/cart/quote', { lines: [{ variantId: ctx.v.id, quantity: 1 }], currency: 'XYZ' })
  expect(Q, 'anon', 'unknown currency falls back to the base currency', qx, 200, typeof qx.data?.quote?.subtotal === 'number')
  expect(Q, 'anon', 'invalid input (quantity 0)', await anon.post('/api/cart/quote', { lines: [{ variantId: ctx.v.id, quantity: 0 }] }), 422)
  expect(Q, 'anon', 'invalid input (no lines)', await anon.post('/api/cart/quote', {}), 422)
  expect(Q, 'anon', 'text/plain body', await anon.post('/api/cart/quote', JSON.stringify({ lines: [] })), 415)
  expect(Q, 'anon', 'cross-site Origin', await anon.post('/api/cart/quote', { lines: [] }, EVIL), 403)

  const O = 'POST /api/orders'
  const mine = await shopper.post('/api/orders', { ...orderBody(ctx.pool[0]), email: shopperEmail })
  expect(O, 'customer', 'customer places a COD order', mine, 201, mine.data?.order?.status === 'placed' && mine.data.order.userId === ctx.shopperId)
  ctx.shopperOrder = mine.data?.order
  if (ctx.shopperOrder) createdOrders.add(ctx.shopperOrder.id)
  const guestBody = orderBody(ctx.pool[1])
  const guest = await anon.post('/api/orders', guestBody)
  expect(O, 'anon', 'guest places a COD order', guest, 201, guest.data?.order?.userId === null)
  ctx.guestOrder = guest.data?.order
  ctx.guestEmail = guestBody.email
  if (ctx.guestOrder) createdOrders.add(ctx.guestOrder.id)
  const ad = await admin.post('/api/orders', orderBody(ctx.pool[2]))
  expect(O, 'admin', 'admin can check out like anyone', ad, 201)
  if (ad.data?.order) createdOrders.add(ad.data.order.id)
  const empty = await anon.post('/api/orders', { ...orderBody(ctx.v), lines: [] })
  expect(O, 'anon', 'empty bag', empty, 422)
  expect(O, 'anon', 'invalid address', await anon.post('/api/orders', { ...orderBody(ctx.v), address: { firstName: '' } }), 422)
  expect(O, 'anon', 'unknown payment method', await anon.post('/api/orders', { ...orderBody(ctx.v), paymentMethod: 'paypal' }), 422)
  expect(O, 'anon', 'currency the shop does not sell in', await anon.post('/api/orders', { ...orderBody(ctx.v), currency: 'JPY' }), 400)
  const unknownVariant = await anon.post('/api/orders', { ...orderBody(ctx.v), lines: [{ variantId: MISSING, quantity: 1 }] })
  check(O, 'anon', 'unknown variant refused (4xx, no order)', unknownVariant.status >= 400 && unknownVariant.status < 500, { status: unknownVariant.status, body: brief(unknownVariant.data) })
  if (!RZP_ON) {
    const online = await anon.post('/api/orders', { ...orderBody(ctx.v), paymentMethod: 'razorpay' })
    expect(O, 'anon', 'online payment while not available', online, 400)
  }
  expect(O, 'anon', 'text/plain body', await anon.post('/api/orders', JSON.stringify(orderBody(ctx.v))), 415)
  expect(O, 'anon', 'cross-site Origin', await anon.post('/api/orders', orderBody(ctx.v), EVIL), 403)

  const OL = 'GET /api/orders'
  expect(OL, 'anon', 'signed out', await anon.get('/api/orders'), 401)
  const list = await shopper.get('/api/orders')
  expect(OL, 'customer', 'own orders only', list, 200, list.data?.orders?.some((o) => o.id === ctx.shopperOrder?.id) && list.data.orders.every((o) => o.userId === ctx.shopperId))
  const otherList = await other.get('/api/orders')
  expect(OL, 'other', "another customer does not see them", otherList, 200, !otherList.data?.orders?.some((o) => o.id === ctx.shopperOrder?.id))

  const OI = 'GET /api/orders/[id]'
  const id = ctx.shopperOrder?.id
  expect(OI, 'anon', 'signed out', await anon.get(`/api/orders/${id}`), 401)
  const own = await shopper.get(`/api/orders/${id}`)
  expect(OI, 'customer', 'own order', own, 200, own.data?.order?.id === id)
  expect(OI, 'other', "someone else's order", await other.get(`/api/orders/${id}`), 404)
  expect(OI, 'customer', "a guest's order", await shopper.get(`/api/orders/${ctx.guestOrder?.id}`), 404)
  expect(OI, 'admin', 'admin may read any order here', await admin.get(`/api/orders/${id}`), 200)
  expect(OI, 'customer', 'unknown id', await shopper.get(`/api/orders/${MISSING}`), 404)

  const LK = 'POST /api/orders/lookup'
  const lk = await anon.post('/api/orders/lookup', { orderNumber: ctx.guestOrder?.orderNumber, email: ctx.guestEmail.toUpperCase() })
  expect(LK, 'anon', 'guest tracking by number + email, address masked', lk, 200, lk.data?.order?.id === ctx.guestOrder?.id && lk.data.order.shippingAddress.line1 !== address.line1 && lk.data.order.userId === null)
  expect(LK, 'anon', 'wrong email', await anon.post('/api/orders/lookup', { orderNumber: ctx.guestOrder?.orderNumber, email: 'someone@example.com' }), 404)
  expect(LK, 'customer', 'customer, wrong email', await shopper.post('/api/orders/lookup', { orderNumber: ctx.guestOrder?.orderNumber, email: shopperEmail }), 404)
  expect(LK, 'anon', 'invalid input', await anon.post('/api/orders/lookup', { orderNumber: '', email: 'x' }), 422)
  expect(LK, 'anon', 'text/plain body', await anon.post('/api/orders/lookup', JSON.stringify({ orderNumber: 'SK', email: ctx.guestEmail })), 415)
  expect(LK, 'anon', 'cross-site Origin', await anon.post('/api/orders/lookup', { orderNumber: ctx.guestOrder?.orderNumber, email: ctx.guestEmail }, EVIL), 403)
}

/* ── Reviews, helpful votes, returns ── */

async function reviewsAndReturns() {
  console.log('\nReviews and returns')
  const R = 'POST /api/products/[handle]/reviews'
  const handle = ctx.pool[0].handle
  const body = { rating: 4, title: 'Audit review', body: 'Written by the endpoint audit script.', fit: 'true' }
  expect(R, 'anon', 'signed out', await anon.post(`/api/products/${handle}/reviews`, body), 401)
  expect(R, 'customer', 'invalid input', await shopper.post(`/api/products/${handle}/reviews`, { rating: 9, title: '', body: 'short' }), 422)
  expect(R, 'customer', 'text/plain body', await shopper.post(`/api/products/${handle}/reviews`, JSON.stringify(body)), 415)
  expect(R, 'customer', 'cross-site Origin', await shopper.post(`/api/products/${handle}/reviews`, body, EVIL), 403)
  expect(R, 'customer', 'unknown product', await shopper.post(`/api/products/${MISSING}/reviews`, body), 404)
  // "Verified" needs a delivered order from this account; this order is still on its way (the
  // verified-after-delivery case is covered in api-smoke.mjs).
  const created = await shopper.post(`/api/products/${handle}/reviews`, body)
  expect(R, 'customer', 'customer reviews a piece ordered but not yet delivered (not verified)', created, 201, created.data?.review?.verified === false)
  ctx.review = created.data?.review
  expect(R, 'customer', 'second review of the same piece', await shopper.post(`/api/products/${handle}/reviews`, body), 409)
  const unverified = await other.post(`/api/products/${handle}/reviews`, { ...body, title: 'Not bought' })
  expect(R, 'other', 'review without a purchase is accepted but not verified', unverified, 201, unverified.data?.review?.verified === false)
  ctx.review2 = unverified.data?.review
  const mine = await shopper.get(`/api/products/${handle}/reviews`)
  check('GET /api/products/[handle]/reviews', 'customer', 'mine = the customer’s own (pending) review', mine.data?.mine?.id === ctx.review?.id, mine.data?.mine)
  check('GET /api/products/[handle]/reviews', 'anon', 'pending review not public', !(await anon.get(`/api/products/${handle}/reviews`)).data?.reviews?.some((r) => r.id === ctx.review?.id))

  // Votes count only on approved reviews; the happy path runs after moderation (adminOperations).
  expect('POST /api/reviews/[id]/helpful', 'anon', 'pending (unpublished) review cannot be voted on', await anon.post(`/api/reviews/${ctx.review?.id}/helpful`), 404)

  const RG = 'GET /api/returns'
  expect(RG, 'anon', 'signed out', await anon.get('/api/returns'), 401)
  const rl = await shopper.get('/api/returns')
  expect(RG, 'customer', 'own returns', rl, 200, Array.isArray(rl.data?.returns))

  const RP = 'POST /api/returns'
  const order = ctx.shopperOrder
  const req = { orderId: order?.id, items: [{ orderItemId: order?.items?.[0]?.id, quantity: 1 }], reason: 'wrong-size' }
  expect(RP, 'anon', 'signed out', await anon.post('/api/returns', req), 401)
  expect(RP, 'customer', 'before delivery', await shopper.post('/api/returns', req), 400)
  const delivered = await admin.patch(`/api/admin/orders/${order?.id}`, { status: 'delivered' })
  expect('PATCH /api/admin/orders/[id]', 'admin', 'mark delivered', delivered, 200, delivered.data?.order?.status === 'delivered')
  expect(RP, 'other', "return on someone else's order", await other.post('/api/returns', req), 404)
  expect(RP, 'customer', 'unknown order', await shopper.post('/api/returns', { ...req, orderId: MISSING }), 404)
  expect(RP, 'customer', 'invalid input', await shopper.post('/api/returns', { ...req, reason: 'because' }), 422)
  expect(RP, 'customer', 'text/plain body', await shopper.post('/api/returns', JSON.stringify(req)), 415)
  expect(RP, 'customer', 'cross-site Origin', await shopper.post('/api/returns', req, EVIL), 403)
  const ret = await shopper.post('/api/returns', req)
  expect(RP, 'customer', 'customer requests a return', ret, 201, ret.data?.return?.status === 'pending')
  ctx.ret = ret.data?.return
  expect(RP, 'customer', 'more than was bought', await shopper.post('/api/returns', req), 400)
  const rl2 = await other.get('/api/returns')
  check(RG, 'other', "another customer does not see it", rl2.status === 200 && !rl2.data?.returns?.some((r) => r.id === ctx.ret?.id))
}

/* ── Newsletter, contact, stock alerts ── */

async function inboxRoutes() {
  console.log('\nNewsletter, contact, stock alerts')
  const N = 'POST /api/newsletter'
  ctx.subEmail = `audit-news-${stamp}@example.com`
  const n1 = await anon.post('/api/newsletter', { email: ctx.subEmail, source: 'audit' })
  expect(N, 'anon', 'subscribe', n1, 200, n1.data?.created === true)
  const n2 = await shopper.post('/api/newsletter', { email: ctx.subEmail.toUpperCase() })
  expect(N, 'customer', 'repeat is idempotent', n2, 200, n2.data?.created === false)
  expect(N, 'anon', 'invalid email', await anon.post('/api/newsletter', { email: 'nope' }), 422)
  expect(N, 'anon', 'invalid source', await anon.post('/api/newsletter', { email: `s-${stamp}@example.com`, source: '=cmd|x' }), 422)
  expect(N, 'anon', 'text/plain body', await anon.post('/api/newsletter', JSON.stringify({ email: `t-${stamp}@example.com` })), 415)
  expect(N, 'anon', "'text/plain;application/json' body", await anon.post('/api/newsletter', JSON.stringify({ email: `t2-${stamp}@example.com` }), { 'Content-Type': 'text/plain;application/json' }), 415)
  expect(N, 'anon', 'cross-site Origin', await anon.post('/api/newsletter', { email: `x-${stamp}@example.com` }, EVIL), 403)

  const C = 'POST /api/contact'
  ctx.contactEmail = `audit-contact-${stamp}@example.com`
  expect(C, 'anon', 'send a message', await anon.post('/api/contact', { name: 'Audit', email: ctx.contactEmail, subject: 'Hello', message: 'A message from the endpoint audit.' }), 201)
  expect(C, 'customer', 'customer sends a message', await shopper.post('/api/contact', { name: 'Audit Shopper', email: shopperEmail, message: 'Another message from the audit.' }), 201)
  expect(C, 'anon', 'message too short', await anon.post('/api/contact', { name: 'A', email: ctx.contactEmail, message: 'short' }), 422)
  expect(C, 'anon', 'text/plain body', await anon.post('/api/contact', JSON.stringify({ name: 'A', email: ctx.contactEmail, message: 'long enough message' })), 415)
  expect(C, 'anon', 'cross-site Origin', await anon.post('/api/contact', { name: 'A', email: ctx.contactEmail, message: 'long enough message' }, EVIL), 403)
  expect(C, 'anon', 'oversized body', await anon.post('/api/contact', { name: 'Big', email: ctx.contactEmail, message: 'x'.repeat(1_100_000) }), 413)

  const SA = 'POST /api/stock-alerts'
  const v = ctx.pool[0]
  expect(SA, 'anon', 'back-in-stock alert', await anon.post('/api/stock-alerts', { productId: v.productId, variantId: v.id, email: `audit-alert-${stamp}@example.com` }), 201)
  expect(SA, 'customer', 'customer alert', await shopper.post('/api/stock-alerts', { productId: v.productId, email: shopperEmail }), 201)
  expect(SA, 'anon', 'unknown product', await anon.post('/api/stock-alerts', { productId: MISSING, email: `audit-alert-${stamp}@example.com` }), 404)
  expect(SA, 'anon', 'invalid input', await anon.post('/api/stock-alerts', { productId: '', email: 'x' }), 422)
  expect(SA, 'anon', 'text/plain body', await anon.post('/api/stock-alerts', JSON.stringify({ productId: v.productId, email: 'a@example.com' })), 415)
  expect(SA, 'anon', 'cross-site Origin', await anon.post('/api/stock-alerts', { productId: v.productId, email: 'a@example.com' }, EVIL), 403)
}

/* ── Online payment routes + webhook ── */

async function paymentRoutes() {
  console.log('\nPayment routes and the Razorpay webhook')
  const P = 'POST /api/orders/[id]/payment'
  const PC = 'POST /api/orders/[id]/payment/cancel'
  const W = 'POST /api/webhooks/razorpay'
  const fakeProof = { razorpayOrderId: 'order_AAAAAAAAAAAA', razorpayPaymentId: 'pay_AAAAAAAAAAAA', razorpaySignature: 'a'.repeat(64) }
  // Input and request-forgery checks need no Razorpay at all.
  expect(P, 'anon', 'unknown order (valid proof shape)', await anon.post(`/api/orders/${MISSING}/payment`, fakeProof), 404)
  expect(P, 'anon', 'a COD order cannot be "paid" this way', await anon.post(`/api/orders/${ctx.guestOrder?.id}/payment`, fakeProof), 404)
  expect(P, 'anon', 'invalid proof', await anon.post(`/api/orders/${MISSING}/payment`, { razorpayOrderId: 'x' }), 422)
  expect(P, 'anon', 'text/plain body', await anon.post(`/api/orders/${MISSING}/payment`, JSON.stringify(fakeProof)), 415)
  expect(P, 'anon', 'cross-site Origin', await anon.post(`/api/orders/${MISSING}/payment`, fakeProof, EVIL), 403)
  expect(PC, 'anon', 'unknown order', await anon.post(`/api/orders/${MISSING}/payment/cancel`, { razorpayOrderId: 'order_AAAAAAAAAAAA' }), 404)
  expect(PC, 'anon', 'a COD order cannot be cancelled this way', await anon.post(`/api/orders/${ctx.guestOrder?.id}/payment/cancel`, { razorpayOrderId: 'order_AAAAAAAAAAAA' }), 404)
  check(PC, 'anon', '…and the COD order is untouched', (await admin.get(`/api/admin/orders/${ctx.guestOrder?.id}`)).data?.order?.status === 'placed')
  expect(PC, 'anon', 'invalid input', await anon.post(`/api/orders/${MISSING}/payment/cancel`, { razorpayOrderId: 'nope' }), 422)
  expect(PC, 'anon', 'text/plain body', await anon.post(`/api/orders/${MISSING}/payment/cancel`, JSON.stringify({ razorpayOrderId: 'order_AAAAAAAAAAAA' })), 415)
  expect(PC, 'anon', 'cross-site Origin', await anon.post(`/api/orders/${MISSING}/payment/cancel`, { razorpayOrderId: 'order_AAAAAAAAAAAA' }, EVIL), 403)

  if (!RZP_ON) {
    const w = await postWebhook('{}', 'a'.repeat(64))
    check(W, 'razorpay', 'without a configured secret → 503 (or 401 when configured)', w.status === 503 || w.status === 401, w)
    notExercised.push('POST /api/orders/[id]/payment, POST /api/orders/[id]/payment/cancel, POST /api/webhooks/razorpay — happy paths need SNUGKNOT_RAZORPAY_* set on the server and here (stand-in API); see scripts/razorpay-smoke.mjs')
    return
  }

  const settings = (await admin.get('/api/admin/settings')).data.settings
  ctx.originalCommerce = settings.commerce
  const on = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, onlinePaymentsEnabled: true } })
  expect('PUT /api/admin/settings', 'admin', 'turn online payments on', on, 200, on.data?.value?.onlinePaymentsEnabled === true)
  try {
    const held = await shopper.post('/api/orders', { ...orderBody(ctx.pool[3]), email: shopperEmail, paymentMethod: 'razorpay' })
    expect('POST /api/orders', 'customer', 'online order held pending payment', held, 201, held.data?.order?.status === 'pending_payment' && held.data?.payment?.razorpayOrderId && !JSON.stringify(held.data).includes(RZP.keySecret))
    const o = held.data?.order
    if (o) createdOrders.add(o.id)
    const rzpId = held.data?.payment?.razorpayOrderId
    const { proof } = pay(rzpId, 'captured')
    expect(P, 'anon', 'forged signature', await anon.post(`/api/orders/${o?.id}/payment`, { ...proof, razorpaySignature: 'b'.repeat(64) }), 400)
    expect(P, 'anon', 'proof for a different Razorpay order', await anon.post(`/api/orders/${o?.id}/payment`, { ...proof, razorpayOrderId: 'order_000000000000' }), 404)
    expect(P, 'anon', 'cross-site with a valid proof', await anon.post(`/api/orders/${o?.id}/payment`, proof, EVIL), 403)
    const ok = await anon.post(`/api/orders/${o?.id}/payment`, proof)
    expect(P, 'anon', 'valid proof → order placed and paid', ok, 200, ok.data?.confirmed === true && ok.data.order?.status === 'placed' && ok.data.order?.paymentStatus === 'paid')
    const again = await shopper.post(`/api/orders/${o?.id}/payment`, proof)
    expect(P, 'customer', 'confirming again is idempotent', again, 200, again.data?.confirmed === true)

    const held2 = await anon.post('/api/orders', { ...orderBody(ctx.pool[3]), paymentMethod: 'razorpay' })
    const o2 = held2.data?.order
    if (o2) createdOrders.add(o2.id)
    expect(PC, 'anon', 'wrong Razorpay order id', await anon.post(`/api/orders/${o2?.id}/payment/cancel`, { razorpayOrderId: 'order_000000000000' }), 404)
    const c = await anon.post(`/api/orders/${o2?.id}/payment/cancel`, { razorpayOrderId: held2.data?.payment?.razorpayOrderId })
    expect(PC, 'anon', 'closing the window releases the hold', c, 200, c.data?.result === 'released')
    const c2 = await shopper.post(`/api/orders/${o?.id}/payment/cancel`, { razorpayOrderId: rzpId })
    expect(PC, 'customer', 'cancel on a paid order changes nothing', c2, 200, c2.data?.result === 'paid')

    const held3 = await anon.post('/api/orders', { ...orderBody(ctx.pool[3]), paymentMethod: 'razorpay' })
    const o3 = held3.data?.order
    if (o3) createdOrders.add(o3.id)
    const { payment } = pay(held3.data?.payment?.razorpayOrderId, 'captured')
    const raw = JSON.stringify({ entity: 'event', event: 'payment.captured', payload: { payment: { entity: payment } }, created_at: Math.floor(Date.now() / 1000) })
    expect(W, 'razorpay', 'bad signature', await postWebhook(raw, 'b'.repeat(64)), 401)
    expect(W, 'razorpay', 'missing signature', await postWebhook(raw, ''), 401)
    expect(W, 'razorpay', 'signature for another body', await postWebhook(raw.replace('captured', 'failed'), signWebhook(raw)), 401)
    const bad = 'not json'
    expect(W, 'razorpay', 'signed but not JSON', await postWebhook(bad, signWebhook(bad)), 400)
    const big = 'x'.repeat(1_000_001)
    expect(W, 'razorpay', 'oversized body', await postWebhook(big, signWebhook(big)), 413)
    expect(W, 'razorpay', 'payment.captured → order placed', await postWebhook(raw, signWebhook(raw)), 200)
    check(W, 'razorpay', '…order is placed', (await admin.get(`/api/admin/orders/${o3?.id}`)).data?.order?.status === 'placed')
    const stranger = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { ...payment, id: 'pay_someoneelse01', order_id: 'order_notthisshop01' } } } })
    expect(W, 'razorpay', "another app's event is ignored", await postWebhook(stranger, signWebhook(stranger)), 200)
    const unknownEvent = JSON.stringify({ event: 'payment.failed', payload: {} })
    expect(W, 'razorpay', 'unhandled event type acknowledged', await postWebhook(unknownEvent, signWebhook(unknownEvent)), 200)
    // Server to server: Razorpay sends no browser Origin, so the webhook does not apply the same-origin rule.
    expect(W, 'razorpay', 'cross-site Origin with a valid signature is still accepted (by design)', await postWebhook(unknownEvent, signWebhook(unknownEvent), EVIL), 200)
  } finally {
    await admin.put('/api/admin/settings', { section: 'commerce', value: ctx.originalCommerce })
  }
}

/* ── Admin: catalogue ── */

async function adminCatalogue() {
  console.log('\nAdmin: catalogue')
  // Products
  const PL = 'GET /api/admin/products'
  const pl = await admin.get('/api/admin/products?q=' + encodeURIComponent(ctx.product.title.split(' ')[0]))
  expect(PL, 'admin', 'list (any status, search)', pl, 200, Array.isArray(pl.data?.products))
  const PG = 'GET /api/admin/products/[id]'
  const full = (await admin.get(`/api/admin/products/${ctx.product.id}`))
  expect(PG, 'admin', 'read one', full, 200, full.data?.product?.id === ctx.product.id)
  expect(PG, 'admin', 'unknown id', await admin.get(`/api/admin/products/${MISSING}`), 404)
  const p = full.data.product
  const editable = {
    handle: p.handle, title: p.title, description: p.description, details: p.details, vendor: p.vendor, productType: p.productType, gender: p.gender, category: p.category,
    tags: p.tags, price: p.price, compareAtPrice: p.compareAtPrice, prices: p.prices ?? {}, images: p.images, colors: p.colors, featured: p.featured, isNew: p.isNew,
    bestseller: p.bestseller, status: p.status, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
    variants: p.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, size: v.size, color: v.color, price: v.price, compareAtPrice: v.compareAtPrice, inventory: v.inventory, prices: v.prices ?? {} })),
  }
  const PP = 'POST /api/admin/products'
  const fresh = { ...editable, handle: `audit-${stamp}`, title: `Audit Piece ${stamp}`, status: 'draft', price: 50, compareAtPrice: null, prices: {}, variants: [{ sku: `AUDIT-${stamp}`, size: 'One Size', color: 'Oat', price: 50, compareAtPrice: null, inventory: 2 }] }
  const created = await admin.post('/api/admin/products', fresh)
  expect(PP, 'admin', 'create (draft)', created, 201, created.data?.product?.handle === fresh.handle)
  const pid = created.data?.product?.id
  expect(PP, 'admin', 'duplicate handle', await admin.post('/api/admin/products', { ...fresh, variants: [{ ...fresh.variants[0], sku: `AUDIT2-${stamp}` }] }), 409)
  expect(PP, 'admin', 'invalid input (no variants)', await admin.post('/api/admin/products', { ...fresh, handle: `audit-b-${stamp}`, variants: [] }), 422)
  expect(PP, 'admin', 'text/plain body', await admin.post('/api/admin/products', JSON.stringify(fresh)), 415)
  check('GET /api/products', 'anon', 'draft product hidden from the storefront', !(await anon.get('/api/products')).data?.products?.some((x) => x.id === pid))
  const PU = 'PUT /api/admin/products/[id]'
  const freshWithIds = { ...fresh, variants: fresh.variants.map((v, i) => ({ ...v, id: created.data?.product?.variants?.[i]?.id })) }
  const upd = await admin.put(`/api/admin/products/${pid}`, { ...freshWithIds, title: `Audit Piece ${stamp} (edited)` })
  expect(PU, 'admin', 'update', upd, 200, upd.data?.product?.title?.endsWith('(edited)'))
  expect(PU, 'admin', 'unknown id', await admin.put(`/api/admin/products/${MISSING}`, { ...fresh, handle: `audit-c-${stamp}`, variants: [{ ...fresh.variants[0], sku: `AUDIT3-${stamp}` }] }), 404)
  expect(PU, 'admin', 'invalid input (compare-at below price)', await admin.put(`/api/admin/products/${pid}`, { ...freshWithIds, compareAtPrice: 1 }), 422)
  expect(PU, 'admin', 'handle taken by another product', await admin.put(`/api/admin/products/${pid}`, { ...freshWithIds, handle: p.handle }), 409)
  expect(PU, 'admin', 'text/plain body', await admin.put(`/api/admin/products/${pid}`, JSON.stringify(fresh)), 415)
  // Quick actions from the product list, on the audit's own draft piece (one size, 2 in stock, 50).
  const PA = 'POST /api/admin/products/actions'
  const act = (body) => admin.post('/api/admin/products/actions', body)
  const after = async () => (await admin.get(`/api/admin/products/${pid}`)).data?.product
  const vid = created.data?.product?.variants?.[0]?.id
  expect(PA, 'admin', 'status → archived', await act({ action: 'status', ids: [pid], status: 'archived' }), 200, (await after())?.status === 'archived')
  expect(PA, 'admin', 'sold out sets every size to 0', await act({ action: 'sold-out', ids: [pid] }), 200, (await after())?.variants.every((v) => v.inventory === 0))
  expect(PA, 'admin', 'restock refills the sold-out sizes', await act({ action: 'restock', ids: [pid], quantity: 7 }), 200, (await after())?.variants.every((v) => v.inventory === 7))
  expect(PA, 'admin', 'stock per size', await act({ action: 'inventory', id: pid, variants: [{ id: vid, inventory: 3 }] }), 200, (await after())?.variants[0]?.inventory === 3)
  const foreign = ctx.product.variants[0]
  await act({ action: 'inventory', id: pid, variants: [{ id: foreign.id, inventory: 0 }] })
  check(PA, 'admin', "another product's size is not touched", (await admin.get(`/api/admin/products/${ctx.product.id}`)).data?.product?.variants?.find((v) => v.id === foreign.id)?.inventory === foreign.inventory)
  const priced = await act({ action: 'price', id: pid, price: 60, compareAtPrice: 80, prices: {} })
  expect(PA, 'admin', 'one price for every size', priced, 200, (await after())?.variants.every((v) => v.price === 60 && v.compareAtPrice === 80))
  expect(PA, 'admin', 'compare-at below the price', await act({ action: 'price', id: pid, price: 60, compareAtPrice: 50, prices: {} }), 422)
  expect(PA, 'admin', 'unknown action', await act({ action: 'explode', ids: [pid] }), 422)
  expect(PA, 'admin', 'no products chosen', await act({ action: 'sold-out', ids: [] }), 422)
  expect(PA, 'admin', 'restock with 0', await act({ action: 'restock', ids: [pid], quantity: 0 }), 422)
  expect(PA, 'admin', 'unknown product', await act({ action: 'sold-out', ids: [MISSING] }), 404)
  expect(PA, 'admin', 'text/plain body', await admin.post('/api/admin/products/actions', JSON.stringify({ action: 'sold-out', ids: [pid] })), 415)
  const spare = await admin.post('/api/admin/products', { ...fresh, handle: `audit-spare-${stamp}`, variants: [{ ...fresh.variants[0], sku: `AUDIT-SPARE-${stamp}` }] })
  const spareId = spare.data?.product?.id
  expect(PA, 'admin', 'delete', await act({ action: 'delete', ids: [spareId] }), 200, (await admin.get(`/api/admin/products/${spareId}`)).status === 404)

  const PD = 'DELETE /api/admin/products/[id]'
  expect(PD, 'admin', 'delete', await admin.del(`/api/admin/products/${pid}`), 200)
  expect(PD, 'admin', 'delete again / unknown id', await admin.del(`/api/admin/products/${pid}`), 404)

  // Categories
  const CG = 'GET /api/admin/categories'
  const cats = await admin.get('/api/admin/categories')
  expect(CG, 'admin', 'list', cats, 200, Array.isArray(cats.data?.categories))
  const inUse = cats.data?.categories?.find((c) => ctx.products.some((pp) => pp.category === c.slug))
  const CP = 'POST /api/admin/categories'
  const slug = `audit-${stamp}`
  const cat = await admin.post('/api/admin/categories', { slug, title: 'Audit Category' })
  expect(CP, 'admin', 'create', cat, 201, cat.data?.category?.slug === slug)
  expect(CP, 'admin', 'duplicate slug', await admin.post('/api/admin/categories', { slug, title: 'Again' }), 409)
  expect(CP, 'admin', 'invalid input', await admin.post('/api/admin/categories', { slug: 'Bad Slug!', title: '' }), 422)
  expect(CP, 'admin', 'image on another host', await admin.post('/api/admin/categories', { slug: `audit-x-${stamp}`, title: 'X', image: 'https://evil.example/x.png' }), 422)
  expect(CP, 'admin', 'text/plain body', await admin.post('/api/admin/categories', JSON.stringify({ slug, title: 'X' })), 415)
  const CU = 'PUT /api/admin/categories/[slug]'
  const cu = await admin.put(`/api/admin/categories/${slug}`, { slug, title: 'Audit Category (edited)', badge: 'NEW' })
  expect(CU, 'admin', 'update', cu, 200, cu.data?.category?.title === 'Audit Category (edited)' && cu.data.category.badge === 'NEW')
  expect(CU, 'admin', 'unknown slug', await admin.put(`/api/admin/categories/${MISSING.replace(/_/g, '-')}`, { slug: MISSING.replace(/_/g, '-'), title: 'X' }), 404)
  expect(CU, 'admin', 'renaming the slug', await admin.put(`/api/admin/categories/${slug}`, { slug: `${slug}-renamed`, title: 'X' }), 400)
  expect(CU, 'admin', 'invalid input', await admin.put(`/api/admin/categories/${slug}`, { slug, title: '', badge: 'X'.repeat(25) }), 422)
  expect(CU, 'admin', 'text/plain body', await admin.put(`/api/admin/categories/${slug}`, JSON.stringify({ slug, title: 'X' })), 415)
  const CD = 'DELETE /api/admin/categories/[slug]'
  if (inUse) expect(CD, 'admin', 'category still used by products', await admin.del(`/api/admin/categories/${inUse.slug}`), 409)
  expect(CD, 'admin', 'delete', await admin.del(`/api/admin/categories/${slug}`), 200)
  expect(CD, 'admin', 'unknown slug', await admin.del(`/api/admin/categories/${slug}`), 404)

  // Collections
  const LG = 'GET /api/admin/collections'
  const cols = await admin.get('/api/admin/collections')
  expect(LG, 'admin', 'list', cols, 200, Array.isArray(cols.data?.collections))
  const LP = 'POST /api/admin/collections'
  const col = await admin.post('/api/admin/collections', { handle: `audit-${stamp}`, title: 'Audit Collection', productIds: [ctx.product.id] })
  expect(LP, 'admin', 'create', col, 201, col.data?.collection?.id)
  const colId = col.data?.collection?.id
  expect(LP, 'admin', 'invalid input', await admin.post('/api/admin/collections', { handle: '', title: '' }), 422)
  // A deliberately malicious value: the server must refuse it.
  // eslint-disable-next-line no-script-url
  expect(LP, 'admin', 'javascript: image refused', await admin.post('/api/admin/collections', { handle: `audit-js-${stamp}`, title: 'X', image: 'javascript:alert(1)' }), 422)
  expect(LP, 'admin', 'text/plain body', await admin.post('/api/admin/collections', JSON.stringify({ handle: 'x', title: 'x' })), 415)
  const LU = 'PUT /api/admin/collections/[id]'
  const lu = await admin.put(`/api/admin/collections/${colId}`, { handle: `audit-${stamp}`, title: 'Audit Collection', subtitle: 'Edited' })
  expect(LU, 'admin', 'update', lu, 200, lu.data?.collection?.subtitle === 'Edited')
  expect(LU, 'admin', 'unknown id', await admin.put(`/api/admin/collections/${MISSING}`, { handle: `audit-z-${stamp}`, title: 'X' }), 404)
  expect(LU, 'admin', 'invalid input', await admin.put(`/api/admin/collections/${colId}`, { handle: 'Bad Handle', title: '' }), 422)
  expect(LU, 'admin', 'text/plain body', await admin.put(`/api/admin/collections/${colId}`, JSON.stringify({ handle: 'x', title: 'x' })), 415)
  const LD = 'DELETE /api/admin/collections/[id]'
  expect(LD, 'admin', 'delete', await admin.del(`/api/admin/collections/${colId}`), 200)
  expect(LD, 'admin', 'unknown id', await admin.del(`/api/admin/collections/${colId}`), 404)

  // Coupons
  const KG = 'GET /api/admin/coupons'
  const cps = await admin.get('/api/admin/coupons')
  expect(KG, 'admin', 'list', cps, 200, Array.isArray(cps.data?.coupons))
  const KP = 'POST /api/admin/coupons'
  const code = `AUD${stamp}`.toUpperCase().slice(0, 20)
  const cp = await admin.post('/api/admin/coupons', { code, type: 'fixed', value: 5, description: 'audit' })
  expect(KP, 'admin', 'create', cp, 201, cp.data?.coupon?.code === code)
  expect(KP, 'admin', 'duplicate code (any case)', await admin.post('/api/admin/coupons', { code: code.toLowerCase(), type: 'fixed', value: 5 }), 409)
  expect(KP, 'admin', 'percentage over 100', await admin.post('/api/admin/coupons', { code: `${code}P`, type: 'percentage', value: 150 }), 422)
  expect(KP, 'admin', 'impossible date', await admin.post('/api/admin/coupons', { code: `${code}D`, type: 'fixed', value: 5, expiresAt: '2026-02-31' }), 422)
  expect(KP, 'admin', 'text/plain body', await admin.post('/api/admin/coupons', JSON.stringify({ code: 'X', type: 'fixed', value: 1 })), 415)
  const KU = 'PUT /api/admin/coupons/[code]'
  const ku = await admin.put(`/api/admin/coupons/${code.toLowerCase()}`, { code, type: 'fixed', value: 7, description: 'audit edited' })
  expect(KU, 'admin', 'update (code matched case-insensitively)', ku, 200, ku.data?.coupon?.value === 7)
  expect(KU, 'admin', 'renaming the code', await admin.put(`/api/admin/coupons/${code}`, { code: `${code}X`, type: 'fixed', value: 7 }), 400)
  expect(KU, 'admin', 'unknown code', await admin.put(`/api/admin/coupons/NOPE${stamp.toUpperCase()}`, { code: `NOPE${stamp.toUpperCase()}`, type: 'fixed', value: 7 }), 404)
  expect(KU, 'admin', 'invalid input', await admin.put(`/api/admin/coupons/${code}`, { code, type: 'bogus', value: -1 }), 422)
  expect(KU, 'admin', 'text/plain body', await admin.put(`/api/admin/coupons/${code}`, JSON.stringify({ code, type: 'fixed', value: 7 })), 415)
  const KD = 'DELETE /api/admin/coupons/[code]'
  expect(KD, 'admin', 'delete', await admin.del(`/api/admin/coupons/${code}`), 200)
  expect(KD, 'admin', 'unknown code', await admin.del(`/api/admin/coupons/${code}`), 404)
  const pct = await admin.del('/api/admin/coupons/BAD%25CODE')
  expect(KD, 'admin', 'code containing a percent sign (%25) → not found, not a server error', pct, 404)
  const pctPut = await admin.put('/api/admin/coupons/BAD%25CODE', { code: 'BADCODE', type: 'fixed', value: 1 })
  expect(KU, 'admin', 'code containing a percent sign (%25) → not found, not a server error', pctPut, 404)

  // Media
  const MG = 'GET /api/admin/media'
  expect(MG, 'admin', 'list', await admin.get('/api/admin/media'), 200)
  const MP = 'POST /api/admin/media'
  const fd = new FormData()
  fd.append('file', new Blob([PNG], { type: 'image/png' }), 'audit.png')
  const up = await admin.post('/api/admin/media', fd)
  expect(MP, 'admin', 'upload a PNG', up, 201, /^\/api\/media\/img_[a-f0-9]{20}$/.test(up.data?.url ?? ''))
  const svg = new FormData()
  svg.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' }), 'x.svg')
  expect(MP, 'admin', 'SVG refused', await admin.post('/api/admin/media', svg), 415)
  const fake = new FormData()
  fake.append('file', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'evil.png')
  expect(MP, 'admin', 'bytes that are not the claimed image type', await admin.post('/api/admin/media', fake), 415)
  expect(MP, 'admin', 'no file', await admin.post('/api/admin/media', new FormData()), 400)
  expect(MP, 'admin', 'JSON instead of a form', await admin.post('/api/admin/media', { file: 'x' }), 400)
  const big = new FormData()
  const bigBuf = Buffer.alloc(4 * 1024 * 1024 + 10)
  PNG.copy(bigBuf)
  big.append('file', new Blob([bigBuf], { type: 'image/png' }), 'big.png')
  expect(MP, 'admin', 'image over 4 MB', await admin.post('/api/admin/media', big), 413)
  const MI = 'GET /api/media/[id]'
  const img = await anon.get(up.data?.url ?? '/api/media/x')
  expect(MI, 'anon', 'uploaded image served with its bytes, type and nosniff', img, 200, img.data?.byteLength === PNG.length && img.headers.get('content-type') === 'image/png' && img.headers.get('x-content-type-options') === 'nosniff')
  // The handler sets "default-src 'none'; …; sandbox" for uploaded files; check that is what the browser receives.
  check(MI, 'anon', "the handler's sandbox CSP reaches the browser", /\bsandbox\b/.test(img.headers.get('content-security-policy') ?? ''), img.headers.get('content-security-policy'))
  expect(MI, 'customer', 'same for a customer', await shopper.get(up.data?.url ?? '/api/media/x'), 200)
  const MD = 'DELETE /api/admin/media/[id]'
  expect(MD, 'admin', 'delete', await admin.del(`/api/admin/media/${up.data?.id}`), 200)
  expect(MD, 'admin', 'unknown id', await admin.del(`/api/admin/media/${up.data?.id}`), 404)
  expect(MI, 'anon', 'deleted image is gone', await anon.get(up.data?.url ?? '/api/media/x'), 404)
}

/* ── Admin: orders, returns, reviews, customers, inbox ── */

async function adminOperations() {
  console.log('\nAdmin: orders, returns, reviews, customers, inbox')
  const OG = 'GET /api/admin/orders'
  const all = await admin.get('/api/admin/orders')
  expect(OG, 'admin', 'list', all, 200, all.data?.orders?.some((o) => o.id === ctx.guestOrder?.id))
  const filtered = await admin.get('/api/admin/orders?status=delivered')
  expect(OG, 'admin', 'status filter', filtered, 200, filtered.data?.orders?.every((o) => o.status === 'delivered'))
  const search = await admin.get(`/api/admin/orders?q=${encodeURIComponent(ctx.guestOrder?.orderNumber ?? '')}`)
  expect(OG, 'admin', 'search by order number', search, 200, search.data?.orders?.some((o) => o.id === ctx.guestOrder?.id))
  expect(OG, 'admin', 'unknown status ignored', await admin.get("/api/admin/orders?status=';--"), 200)
  const OI = 'GET /api/admin/orders/[id]'
  const one = await admin.get(`/api/admin/orders/${ctx.guestOrder?.id}`)
  expect(OI, 'admin', 'read one (full address)', one, 200, one.data?.order?.shippingAddress?.line1 === address.line1)
  expect(OI, 'admin', 'unknown id', await admin.get(`/api/admin/orders/${MISSING}`), 404)
  const OP = 'PATCH /api/admin/orders/[id]'
  const notes = await admin.patch(`/api/admin/orders/${ctx.guestOrder?.id}`, { adminNotes: 'audit note', trackingNumber: 'AUDIT123' })
  expect(OP, 'admin', 'notes + tracking', notes, 200, notes.data?.order?.trackingNumber === 'AUDIT123')
  expect(OP, 'admin', 'unknown id', await admin.patch(`/api/admin/orders/${MISSING}`, { adminNotes: 'x' }), 404)
  expect(OP, 'admin', 'invalid status', await admin.patch(`/api/admin/orders/${ctx.guestOrder?.id}`, { status: 'teleported' }), 422)
  expect(OP, 'admin', 'pending_payment cannot be set by hand', await admin.patch(`/api/admin/orders/${ctx.guestOrder?.id}`, { status: 'pending_payment' }), 422)
  expect(OP, 'admin', 'text/plain body', await admin.patch(`/api/admin/orders/${ctx.guestOrder?.id}`, JSON.stringify({ adminNotes: 'x' })), 415)
  const cust = await shopper.get(`/api/orders/${ctx.shopperOrder?.id}`)
  check('GET /api/orders/[id]', 'customer', 'staff notes never reach the customer', cust.status === 200 && !JSON.stringify(cust.data).includes('audit note'))

  const RG = 'GET /api/admin/returns'
  const rets = await admin.get('/api/admin/returns')
  expect(RG, 'admin', 'list', rets, 200, rets.data?.returns?.some((r) => r.id === ctx.ret?.id))
  const RP = 'PATCH /api/admin/returns/[id]'
  expect(RP, 'admin', 'approve', await admin.patch(`/api/admin/returns/${ctx.ret?.id}`, { status: 'approved' }), 200)
  expect(RP, 'admin', 'unknown id', await admin.patch(`/api/admin/returns/${MISSING}`, { status: 'approved' }), 404)
  expect(RP, 'admin', 'invalid status', await admin.patch(`/api/admin/returns/${ctx.ret?.id}`, { status: 'lost' }), 422)
  expect(RP, 'admin', 'text/plain body', await admin.patch(`/api/admin/returns/${ctx.ret?.id}`, JSON.stringify({ status: 'approved' })), 415)
  const myRets = await shopper.get('/api/returns')
  check('GET /api/returns', 'customer', 'customer sees the approved status', myRets.data?.returns?.find((r) => r.id === ctx.ret?.id)?.status === 'approved')

  const VG = 'GET /api/admin/reviews'
  const pending = await admin.get('/api/admin/reviews?status=pending')
  expect(VG, 'admin', 'pending filter', pending, 200, pending.data?.reviews?.some((r) => r.id === ctx.review?.id) && pending.data.reviews.every((r) => r.status === 'pending'))
  expect(VG, 'admin', 'unknown filter ignored', await admin.get('/api/admin/reviews?status=x'), 200)
  const VP = 'PATCH /api/admin/reviews/[id]'
  const appr = await admin.patch(`/api/admin/reviews/${ctx.review?.id}`, { status: 'approved', adminReply: 'Thanks!' })
  expect(VP, 'admin', 'approve with a reply', appr, 200, appr.data?.review?.status === 'approved')
  check('GET /api/products/[handle]/reviews', 'anon', 'approved review is public, without account ids', (await anon.get(`/api/products/${ctx.pool[0].handle}/reviews`)).data?.reviews?.some((r) => r.id === ctx.review?.id && !('userId' in r)))
  const H = 'POST /api/reviews/[id]/helpful'
  const voter = new Client('anon')
  const h1 = await voter.post(`/api/reviews/${ctx.review?.id}/helpful`)
  expect(H, 'anon', 'mark an approved review helpful', h1, 200, typeof h1.data?.helpful === 'number' && h1.data.helpful >= 1)
  expect(H, 'anon', 'same visitor twice', await voter.post(`/api/reviews/${ctx.review?.id}/helpful`), 429)
  expect(H, 'anon', 'unknown review', await anon.post(`/api/reviews/${MISSING}/helpful`), 404)
  expect(H, 'anon', 'cross-site Origin', await anon.post(`/api/reviews/${ctx.review?.id}/helpful`, undefined, EVIL), 403)
  expect(H, 'customer', 'customer marks helpful', await shopper.post(`/api/reviews/${ctx.review?.id}/helpful`), 200)
  expect(VP, 'admin', 'unknown id', await admin.patch(`/api/admin/reviews/${MISSING}`, { status: 'approved' }), 404)
  expect(VP, 'admin', 'invalid status', await admin.patch(`/api/admin/reviews/${ctx.review?.id}`, { status: 'great' }), 422)
  expect(VP, 'admin', 'text/plain body', await admin.patch(`/api/admin/reviews/${ctx.review?.id}`, JSON.stringify({ status: 'approved' })), 415)
  const VD = 'DELETE /api/admin/reviews/[id]'
  expect(VD, 'admin', 'delete', await admin.del(`/api/admin/reviews/${ctx.review2?.id}`), 200)
  expect(VD, 'admin', 'unknown id', await admin.del(`/api/admin/reviews/${ctx.review2?.id}`), 404)

  const UG = 'GET /api/admin/customers'
  const custs = await admin.get('/api/admin/customers')
  expect(UG, 'admin', 'list, no password hashes', custs, 200, custs.data?.customers?.some((u) => u.id === ctx.shopperId) && !JSON.stringify(custs.data).match(/password_?hash|\$scrypt|\$argon/i))
  const UP = 'PATCH /api/admin/customers/[id]'
  const pts = await admin.patch(`/api/admin/customers/${ctx.otherId}`, { points: 250 })
  expect(UP, 'admin', 'set points', pts, 200)
  check(UP, 'other', '…customer sees the new balance', (await other.get('/api/auth/me')).data?.user?.points === 250)
  expect(UP, 'admin', 'unknown id', await admin.patch(`/api/admin/customers/${MISSING}`, { points: 1 }), 404)
  expect(UP, 'admin', 'invalid role', await admin.patch(`/api/admin/customers/${ctx.otherId}`, { role: 'god' }), 422)
  expect(UP, 'admin', 'negative points', await admin.patch(`/api/admin/customers/${ctx.otherId}`, { points: -5 }), 422)
  expect(UP, 'admin', 'removing your own admin role', await admin.patch(`/api/admin/customers/${ctx.adminId}`, { role: 'customer' }), 400)
  expect(UP, 'admin', 'text/plain body', await admin.patch(`/api/admin/customers/${ctx.otherId}`, JSON.stringify({ points: 1 })), 415)

  const MG = 'GET /api/admin/messages'
  const msgs = await admin.get('/api/admin/messages')
  const m = msgs.data?.messages?.find((x) => x.email === ctx.contactEmail)
  expect(MG, 'admin', 'list includes the contact message', msgs, 200, !!m)
  const MP = 'PATCH /api/admin/messages/[id]'
  expect(MP, 'admin', 'mark read', await admin.patch(`/api/admin/messages/${m?.id}`, { status: 'read' }), 200)
  expect(MP, 'admin', 'unknown id', await admin.patch(`/api/admin/messages/${MISSING}`, { status: 'read' }), 404)
  expect(MP, 'admin', 'invalid status', await admin.patch(`/api/admin/messages/${m?.id}`, {}), 422)
  expect(MP, 'admin', 'text/plain body', await admin.patch(`/api/admin/messages/${m?.id}`, JSON.stringify({ status: 'read' })), 415)
  const MD = 'DELETE /api/admin/messages/[id]'
  expect(MD, 'admin', 'delete', await admin.del(`/api/admin/messages/${m?.id}`), 200)
  expect(MD, 'admin', 'unknown id', await admin.del(`/api/admin/messages/${m?.id}`), 404)
  const leftover = (await admin.get('/api/admin/messages')).data?.messages?.find((x) => x.email === shopperEmail)
  if (leftover) await admin.del(`/api/admin/messages/${leftover.id}`)

  const SG = 'GET /api/admin/subscribers'
  const subs = await admin.get('/api/admin/subscribers')
  expect(SG, 'admin', 'list', subs, 200, subs.data?.subscribers?.some((s) => s.email === ctx.subEmail))
  const csv = await admin.get('/api/admin/subscribers?format=csv')
  expect(SG, 'admin', 'CSV export, not cacheable', csv, 200, /text\/csv/.test(csv.headers.get('content-type') ?? '') && String(csv.data).startsWith('email,source,subscribed_at') && csv.headers.get('cache-control') === 'no-store')
  const SD = 'DELETE /api/admin/subscribers'
  expect(SD, 'admin', 'remove', await admin.del(`/api/admin/subscribers?email=${encodeURIComponent(ctx.subEmail)}`), 200)
  expect(SD, 'admin', 'unknown email', await admin.del(`/api/admin/subscribers?email=${encodeURIComponent(ctx.subEmail)}`), 404)
  expect(SD, 'admin', 'no email given', await admin.del('/api/admin/subscribers'), 404)

  const AG = 'GET /api/admin/stock-alerts'
  const alerts = await admin.get('/api/admin/stock-alerts')
  expect(AG, 'admin', 'list includes the alert', alerts, 200, alerts.data?.alerts?.some((a) => a.email === `audit-alert-${stamp}@example.com`))
}

/* ── Admin: settings, stats, notifications ── */

async function adminSettingsAndMisc() {
  console.log('\nAdmin: settings, stats, test email')
  const SG = 'GET /api/admin/settings'
  const s = await admin.get('/api/admin/settings')
  expect(SG, 'admin', 'read all sections', s, 200, ['store', 'commerce', 'announcement', 'reviews', 'homepage', 'seo', 'videos'].every((k) => s.data?.settings?.[k]))
  check(SG, 'admin', 'no Razorpay secret in the settings payload', !RZP.keySecret || !JSON.stringify(s.data).includes(RZP.keySecret))
  const settings = s.data.settings
  const SP = 'PUT /api/admin/settings'
  const ann = await admin.put('/api/admin/settings', { section: 'announcement', value: { ...settings.announcement, messages: ['Audit banner'] } })
  expect(SP, 'admin', 'save a section', ann, 200, ann.data?.value?.messages?.[0] === 'Audit banner')
  const restore = await admin.put('/api/admin/settings', { section: 'announcement', value: settings.announcement })
  expect(SP, 'admin', 'restore it', restore, 200)
  expect(SP, 'admin', 'unknown section', await admin.put('/api/admin/settings', { section: 'secrets', value: {} }), 422)
  expect(SP, 'admin', 'invalid value', await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, currency: 'dollars' } }), 422)
  // A deliberately malicious value: the server must refuse it.
  // eslint-disable-next-line no-script-url
  expect(SP, 'admin', 'javascript: link', await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, primaryCtaHref: 'javascript:alert(1)' } }), 422)
  const otherCode = settings.commerce.currency === 'INR' ? 'USD' : 'INR'
  expect(SP, 'admin', 'relabelling the main currency (only the conversion tool may change it)', await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, currency: otherCode } }), 400)
  // Refusals only: a real switch would change the currency under the rest of the audit
  // (scripts/currency-switch-smoke.mjs runs one on its own database).
  const SC = 'POST /api/admin/settings/currency'
  expect(SC, 'admin', 'to the current currency', await admin.post('/api/admin/settings/currency', { code: settings.commerce.currency, rate: 1 }), 400)
  expect(SC, 'admin', 'no rate', await admin.post('/api/admin/settings/currency', { code: otherCode }), 422)
  expect(SC, 'admin', 'negative rate', await admin.post('/api/admin/settings/currency', { code: otherCode, rate: -3 }), 422)
  expect(SC, 'admin', 'unknown currency', await admin.post('/api/admin/settings/currency', { code: 'ZZZ', rate: 2 }), 422)
  expect(SC, 'admin', 'text/plain body', await admin.post('/api/admin/settings/currency', JSON.stringify({ code: otherCode, rate: 2 })), 415)
  expect(SP, 'admin', 'text/plain body', await admin.put('/api/admin/settings', JSON.stringify({ section: 'announcement', value: settings.announcement })), 415)
  const after = (await admin.get('/api/admin/settings')).data?.settings
  check(SP, 'admin', 'settings unchanged after the refused writes', JSON.stringify(after) === JSON.stringify(settings), 'settings differ')

  const ST = 'GET /api/admin/stats'
  const st = await admin.get('/api/admin/stats')
  expect(ST, 'admin', 'dashboard stats + database kind', st, 200, typeof st.data?.stats?.orders === 'number' && typeof st.data?.database?.kind === 'string')

  const NT = 'POST /api/admin/notifications/test'
  const nt = await admin.post('/api/admin/notifications/test')
  expect(NT, 'admin', 'send a test notice', nt, 200, typeof nt.data?.configured === 'boolean')
}

/* ── Page guards: admin pages (proxy + requireAdminPage) and account pages ── */

const ADMIN_PAGES = ['/admin', '/admin/categories', '/admin/collections', '/admin/coupons', '/admin/customers', '/admin/emails', '/admin/inbox', '/admin/media', '/admin/orders', '/admin/products', '/admin/products/new', '/admin/returns', '/admin/reviews', '/admin/settings', '/admin/videos']

async function pageGuards() {
  console.log('\nPage guards')
  ADMIN_PAGES.push(`/admin/orders/${ctx.guestOrder?.id}`, `/admin/products/${ctx.product.id}`)
  for (const path of ADMIN_PAGES) {
    const key = `PAGE ${path.replace(ctx.guestOrder?.id ?? '§', '[id]').replace(ctx.product.id, '[id]')}`
    const a = await fetch(BASE + path, { redirect: 'manual' })
    check(key, 'anon', 'signed out → 307 to /admin/login', a.status === 307 && /\/admin\/login(\?|$)/.test(a.headers.get('location') ?? '') && !/denied/.test(a.headers.get('location') ?? ''), { status: a.status, location: a.headers.get('location') })
    const c = await fetch(BASE + path, { headers: { Cookie: shopper.cookie }, redirect: 'manual' })
    check(key, 'customer', 'customer → 307 to /admin/login?denied=1', c.status === 307 && /denied=1/.test(c.headers.get('location') ?? ''), { status: c.status, location: c.headers.get('location') })
    const ad = await fetch(BASE + path, { headers: { Cookie: admin.cookie }, redirect: 'manual' })
    check(key, 'admin', 'admin → 200', ad.status === 200, ad.status)
  }
  const login = await fetch(`${BASE}/admin/login`, { redirect: 'manual' })
  check('PAGE /admin/login', 'anon', 'sign-in page open to everyone → 200', login.status === 200, login.status)

  const ACCOUNT = ['/account', '/account/orders', '/account/profile', '/account/returns', '/account/returns/new', '/account/rewards', '/account/wishlist']
  for (const path of ACCOUNT) {
    const key = `PAGE ${path}`
    const a = await fetch(BASE + path, { redirect: 'manual' })
    const ab = await a.text()
    check(key, 'anon', 'signed out → sign-in gate, no customer data', a.status === 200 && !ab.includes(shopperEmail) && !ab.includes(ctx.shopperOrder?.orderNumber ?? '§'), a.status)
    const c = await fetch(BASE + path, { headers: { Cookie: shopper.cookie }, redirect: 'manual' })
    check(key, 'customer', 'customer → 200', c.status === 200, c.status)
  }
  const OK = 'PAGE /account/orders/[id]'
  const own = await fetch(`${BASE}/account/orders/${ctx.shopperOrder?.id}`, { headers: { Cookie: shopper.cookie } })
  const ownBody = await own.text()
  check(OK, 'customer', 'own order → 200 with its number', own.status === 200 && ownBody.includes(ctx.shopperOrder?.orderNumber ?? '§'), own.status)
  const others = await fetch(`${BASE}/account/orders/${ctx.shopperOrder?.id}`, { headers: { Cookie: other.cookie } })
  const othersBody = await others.text()
  check(OK, 'other', "someone else's order → 404, nothing leaked", others.status === 404 && !othersBody.includes(ctx.shopperOrder?.orderNumber ?? '§'), others.status)
  const anonOrder = await fetch(`${BASE}/account/orders/${ctx.shopperOrder?.id}`)
  check(OK, 'anon', 'signed out → gate, nothing leaked', !(await anonOrder.text()).includes(ctx.shopperOrder?.orderNumber ?? '§'), anonOrder.status)
}

/* ── Unsupported methods, headers ── */

async function methodsAndHeaders() {
  console.log('\nUnsupported methods')
  for (const [method, path, key] of [
    ['DELETE', '/api/products', 'DELETE /api/products'],
    ['PUT', '/api/orders', 'PUT /api/orders'],
    ['GET', '/api/auth/login', 'GET /api/auth/login'],
    ['PATCH', '/api/admin/stats', 'PATCH /api/admin/stats'],
  ]) {
    const r = await admin.req(method, path, method === 'GET' ? undefined : {})
    check(`(unsupported) ${key}`, 'admin', 'unsupported method → 405', r.status === 405, r.status)
  }
}

/* ── Admin sign-out ends every admin session; a stale signed cookie passes the proxy but not the handler ── */

async function sessionEnd() {
  console.log('\nSessions')
  const laptop = new Client('admin')
  await laptop.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  const stale = admin.cookie
  const out = await laptop.post('/api/auth/logout')
  expect('POST /api/auth/logout', 'admin', 'admin signs out', out, 200, !laptop.cookie)
  const r = await anon.get('/api/admin/stats', { Cookie: stale })
  check('GET /api/admin/stats', 'revoked', "another device's admin cookie is refused after sign-out (proxy passes, handler → 401)", r.status === 401, r.status)
  const page = await fetch(`${BASE}/admin/orders`, { headers: { Cookie: stale }, redirect: 'manual' })
  check('PAGE /admin/orders', 'revoked', 'revoked admin cookie → redirected by requireAdminPage', page.status === 307 && /\/admin\/login/.test(page.headers.get('location') ?? ''), page.status)
  // Sign back in for clean-up.
  admin.cookie = ''
  await admin.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
}

async function cleanup() {
  console.log('\nClean-up')
  let n = 0
  for (const id of createdOrders) {
    const o = (await admin.get(`/api/admin/orders/${id}`)).data?.order
    if (o && o.status !== 'cancelled' && o.status !== 'delivered') {
      if ((await admin.patch(`/api/admin/orders/${id}`, { status: 'cancelled' })).status === 200) n++
    }
  }
  console.log(`  cancelled ${n} audit order(s) so their stock goes back`)
  if (ctx.review) await admin.del(`/api/admin/reviews/${ctx.review.id}`)
}

/* ───────────── Coverage: every route handler on disk ───────────── */

function handlersOnDisk() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'api')
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (name === 'route.ts') {
        const route = '/api/' + relative(root, dirname(p)).split(sep).join('/')
        const src = readFileSync(p, 'utf8')
        for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)) out.push(`${m[1]} ${route}`)
      }
    }
  }
  walk(root)
  return out.sort()
}

function report() {
  const disk = handlersOnDisk()
  const rows = [...matrix.entries()].sort(([a], [b]) => a.split(' ')[1].localeCompare(b.split(' ')[1]) || a.localeCompare(b))
  const w1 = Math.max(...rows.map(([k]) => k.length), 20)
  const w2 = Math.max(...rows.map(([, e]) => [...e.roles].join(',').length), 10)
  console.log(`\n${'Endpoint'.padEnd(w1)}  ${'Roles tested'.padEnd(w2)}  Result`)
  console.log(`${'-'.repeat(w1)}  ${'-'.repeat(w2)}  ------`)
  for (const [k, e] of rows) {
    console.log(`${k.padEnd(w1)}  ${[...e.roles].sort().join(',').padEnd(w2)}  ${e.fail ? `FAIL ${e.fail}/${e.pass + e.fail}` : `PASS ${e.pass}`}`)
  }
  const missing = disk.filter((k) => !matrix.has(k))
  console.log(`\nRoute handlers on disk: ${disk.length}; exercised: ${disk.length - missing.length}`)
  for (const k of missing) console.log(`  NOT EXERCISED: ${k}`)
  for (const n of notExercised) console.log(`  PARTIAL: ${n}`)
  if (failed.length) {
    console.log('\nFailures:')
    for (const f of failed) console.log(`  ✗ ${f}`)
  }
  console.log(`\n${passes} passed, ${failures} failed\n`)
  return missing.length
}

main()
  .catch((err) => {
    console.error(err)
    failures++
  })
  .finally(() => {
    mock?.close()
    const missing = report()
    process.exit(failures || missing ? 1 : 0)
  })
