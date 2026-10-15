#!/usr/bin/env node
/**
 * End-to-end test of online payments, against a local stand-in for the Razorpay API that this script
 * runs itself. No Razorpay account is involved and no money moves. Local development only.
 *
 * 1. A throwaway Postgres database (the test edits rows directly to fake the passage of time):
 *      createdb snugknot_rzp_test
 * 2. Build and start the shop with test keys and the stand-in API (any rzp_test_ id and secrets):
 *      export SNUGKNOT_DATABASE_URL=postgres://localhost/snugknot_rzp_test
 *      export SNUGKNOT_RAZORPAY_KEY_ID=rzp_test_local SNUGKNOT_RAZORPAY_KEY_SECRET=… SNUGKNOT_RAZORPAY_WEBHOOK_SECRET=…
 *      export SNUGKNOT_RAZORPAY_API_BASE=http://127.0.0.1:4010/v1 ADMIN_EMAIL=… ADMIN_PASSWORD=… AUTH_SECRET=…
 *      npm run build && npm start
 * 3. In another shell, with the same variables:
 *      BASE_URL=http://localhost:3000 node scripts/razorpay-smoke.mjs
 *
 * It takes a little over a minute: the unpaid-order sweep runs at most once a minute.
 */
import { createHmac, randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
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
const ADMIN_EMAIL = env('ADMIN_EMAIL')
const ADMIN_PASSWORD = env('ADMIN_PASSWORD')
const KEY_ID = env('SNUGKNOT_RAZORPAY_KEY_ID')
const KEY_SECRET = env('SNUGKNOT_RAZORPAY_KEY_SECRET')
const WEBHOOK_SECRET = env('SNUGKNOT_RAZORPAY_WEBHOOK_SECRET')
const API_BASE = new URL(env('SNUGKNOT_RAZORPAY_API_BASE'))
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
/** Waits for work the server does after responding (`after`). */
async function eventually(fn, ms = 8000) {
  const end = Date.now() + ms
  for (;;) {
    const v = await fn()
    if (v || Date.now() > end) return v
    await sleep(250)
  }
}

/* ───────────── A stand-in for the Razorpay REST API ───────────── */

const rzp = { orders: new Map(), payments: new Map(), calls: [], failNextOrder: false, authFailures: 0 }
const rid = (p) => `${p}_${randomBytes(7).toString('hex')}`
const expectedAuth = `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`

const mock = createServer(async (req, res) => {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
  const path = req.url.replace(API_BASE.pathname.replace(/\/$/, ''), '')
  rzp.calls.push({ method: req.method, path, body })
  if (req.headers.authorization !== expectedAuth) {
    rzp.authFailures++
    return send(401, { error: { description: 'Authentication failed' } })
  }
  let m
  if (req.method === 'POST' && path === '/orders') {
    if (rzp.failNextOrder) {
      rzp.failNextOrder = false
      return send(500, { error: { description: 'Simulated outage' } })
    }
    const o = { id: rid('order'), entity: 'order', amount: body.amount, currency: body.currency, receipt: body.receipt, notes: body.notes, status: 'created' }
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
    if (p.status !== 'authorized') return send(400, { error: { description: 'This payment has already been captured' } })
    if (body.amount !== p.amount) return send(400, { error: { description: 'Capture amount must equal the authorized amount' } })
    p.status = 'captured'
    return send(200, p)
  }
  send(404, { error: { description: `no mock for ${req.method} ${path}` } })
})

/** A customer paying in Razorpay's window: returns what Checkout hands the browser. */
function pay(razorpayOrderId, { status = 'captured', amount } = {}) {
  const o = rzp.orders.get(razorpayOrderId)
  const p = { id: rid('pay'), entity: 'payment', order_id: razorpayOrderId, amount: amount ?? o.amount, currency: o.currency, status, amount_refunded: 0, method: 'card' }
  rzp.payments.set(p.id, p)
  const signature = createHmac('sha256', KEY_SECRET).update(`${razorpayOrderId}|${p.id}`).digest('hex')
  return { payment: p, proof: { razorpayOrderId, razorpayPaymentId: p.id, razorpaySignature: signature } }
}

/* ───────────── HTTP client for the shop ───────────── */

const randomIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
const RUN_IP = randomIp()
const COOKIE_RE = /^(__Host-)?sk_session=/
class Client {
  constructor(ip = RUN_IP) {
    this.ip = ip
    this.cookie = ''
  }
  async req(method, path, body, extraHeaders = {}) {
    // 'rotate': a new address per request, so per-IP order limits do not cut the run short.
    const headers = { Origin: BASE, 'X-Real-IP': this.ip === 'rotate' ? randomIp() : this.ip, ...extraHeaders }
    if (this.cookie) headers.Cookie = this.cookie
    let payload
    if (typeof body === 'string') payload = body
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' })
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';')
      if (COOKIE_RE.test(pair)) this.cookie = pair.endsWith('=') ? '' : pair
    }
    const type = res.headers.get('content-type') || ''
    const data = type.includes('json') ? await res.json() : await res.text()
    return { status: res.status, data, headers: res.headers }
  }
  get = (p) => this.req('GET', p)
  post = (p, b, h) => this.req('POST', p, b, h)
  put = (p, b) => this.req('PUT', p, b)
  patch = (p, b) => this.req('PATCH', p, b)
}

function webhook(event, payment) {
  const raw = JSON.stringify({ entity: 'event', event, contains: ['payment'], payload: { payment: { entity: payment } }, created_at: Math.floor(Date.now() / 1000) })
  const sig = createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex')
  return { raw, sig }
}
const postWebhook = (raw, sig) =>
  fetch(`${BASE}/api/webhooks/razorpay`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': sig }, body: raw }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }))

const stamp = Date.now().toString(36)
const address = { firstName: 'Ada', lastName: 'Loom', line1: '1 Weaver Lane', city: 'Brooklyn', state: 'NY', postalCode: '11201', country: 'United States', phone: '+1 555 0100' }
let emailN = 0
const nextEmail = () => `rzp-${stamp}-${++emailN}@example.com`
const stock = async (variantId) => (await sql('SELECT inventory FROM variants WHERE id = $1', [variantId]))[0].inventory
const orderRow = async (id) => (await sql('SELECT status, payment_status, payment_method, paid_at, razorpay_order_id, razorpay_payment_id FROM orders WHERE id = $1', [id]))[0]
const notices = async (type, orderNumber) => (await sql('SELECT count(*)::int AS n FROM notifications WHERE type = $1 AND subject LIKE $2', [type, `%${orderNumber}%`]))[0].n

async function main() {
  await new Promise((r) => mock.listen(Number(API_BASE.port), API_BASE.hostname, r))
  console.log(`\nRazorpay smoke test → ${BASE} (stand-in API on ${API_BASE.origin})\n`)
  const admin = new Client()
  const anon = new Client('rotate')
  const shopper = new Client()

  const login = await admin.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  check('admin signs in', login.status === 200, login.status)
  const settings = (await admin.get('/api/admin/settings')).data.settings
  const original = settings.commerce
  const setCommerce = (patch) => admin.put('/api/admin/settings', { section: 'commerce', value: { ...original, ...patch } })

  const products = (await anon.get('/api/products')).data.products
  const pool = products.flatMap((p) => p.variants.filter((v) => v.inventory >= 4).map((v) => ({ ...v, productId: p.id })))
  check('catalogue has variants with stock', pool.length >= 6, pool.length)
  const [vA, vB, vC, vD, vE, vF] = pool
  const orderBody = (variant, extra = {}) => ({ lines: [{ variantId: variant.id, quantity: 1 }], shippingMethod: 'standard', email: nextEmail(), address, paymentMethod: 'razorpay', ...extra })

  console.log('\nSwitch off: behaviour as before')
  await setCommerce({ onlinePaymentsEnabled: false, codEnabled: true })
  const off = await anon.post('/api/orders', orderBody(vA))
  check('online payment refused while the switch is off → 400', off.status === 400 && /not available/.test(off.data.error), off.data)
  const faqOff = await anon.get('/faq')
  check('FAQ still says card payments are coming soon', faqOff.data.includes('Online card payments are coming soon'))
  const codOff = await anon.post('/api/orders', { ...orderBody(vA), paymentMethod: 'cod' })
  check('cash on delivery still places straight away', codOff.status === 201 && codOff.data.order.status === 'placed' && !codOff.data.payment, codOff.data)
  const badMethod = await anon.post('/api/orders', { ...orderBody(vA), paymentMethod: 'paypal' })
  check('unknown payment method → 422', badMethod.status === 422, badMethod.status)

  console.log('\nSwitch on')
  const on = await setCommerce({ onlinePaymentsEnabled: true })
  check('admin turns online payments on', on.status === 200 && on.data.value.onlinePaymentsEnabled === true, on.data)
  const faqOn = await anon.get('/faq')
  check('FAQ now describes paying online', faqOn.data.includes('Pay online at checkout'))

  console.log('\nPaying online (signed-in customer, auto-capture off)')
  await shopper.post('/api/auth/signup', { name: 'Ada Loom', email: `rzp-shopper-${stamp}@example.com`, password: 'knit-and-purl-9' })
  const pointsBefore = (await shopper.get('/api/auth/me')).data.user.points
  const stockA = await stock(vA.id)
  const p1 = await shopper.post('/api/orders', { ...orderBody(vA), email: `rzp-shopper-${stamp}@example.com` })
  const o1 = p1.data.order
  check('order saved as pending_payment → 201 with a payment to open', p1.status === 201 && o1.status === 'pending_payment' && p1.data.payment?.provider === 'razorpay', p1.data)
  check('payment carries the key id, never the secret', p1.data.payment?.keyId === KEY_ID && !JSON.stringify(p1.data).includes(KEY_SECRET))
  const created = rzp.orders.get(p1.data.payment.razorpayOrderId)
  check('Razorpay order is for the total in cents', created && created.amount === Math.round(o1.total * 100) && created.currency === 'USD', { created, total: o1.total })
  check('Razorpay order carries the order number as receipt', created?.receipt === o1.orderNumber)
  check('the server authenticated with the key pair', rzp.authFailures === 0)
  check('stock is held while the customer pays', (await stock(vA.id)) === stockA - 1)
  check('no points granted before payment', (await shopper.get('/api/auth/me')).data.user.points === pointsBefore)
  check('pending order hidden from the customer’s order list', !(await shopper.get('/api/orders')).data.orders.some((o) => o.id === o1.id))
  check('pending order hidden from guest tracking', (await anon.post('/api/orders/lookup', { orderNumber: o1.orderNumber, email: `rzp-shopper-${stamp}@example.com` })).status === 404)
  check('no "new order" email yet', (await notices('order.placed', o1.orderNumber)) === 0)

  const { proof: proof1 } = pay(p1.data.payment.razorpayOrderId, { status: 'authorized' })
  const forged = await anon.post(`/api/orders/${o1.id}/payment`, { ...proof1, razorpaySignature: 'a'.repeat(64) })
  check('forged signature → 400, order still pending', forged.status === 400 && (await orderRow(o1.id)).status === 'pending_payment', forged.data)
  const wrongOrder = await anon.post(`/api/orders/${o1.id}/payment`, { ...proof1, razorpayOrderId: 'order_000000000000' })
  check('proof for another Razorpay order → 404', wrongOrder.status === 404, wrongOrder.status)
  const crossSite = await anon.post(`/api/orders/${o1.id}/payment`, proof1, { Origin: 'https://evil.example' })
  check('cross-site confirmation refused → 403', crossSite.status === 403, crossSite.status)
  const ok1 = await anon.post(`/api/orders/${o1.id}/payment`, proof1)
  check('valid proof → confirmed, order placed and paid', ok1.status === 200 && ok1.data.confirmed === true && ok1.data.order.status === 'placed' && ok1.data.order.paymentStatus === 'paid', ok1.data)
  check('authorised payment was captured', rzp.payments.get(proof1.razorpayPaymentId).status === 'captured')
  check('payment reference stored', ok1.data.order.paymentReference === proof1.razorpayPaymentId && !!ok1.data.order.paidAt)
  const expectedPoints = pointsBefore + Math.floor(o1.total * original.pointsPerDollar)
  check('points granted once paid', (await shopper.get('/api/auth/me')).data.user.points === expectedPoints)
  const again = await anon.post(`/api/orders/${o1.id}/payment`, proof1)
  check('confirming twice changes nothing', again.data.confirmed === true && (await shopper.get('/api/auth/me')).data.user.points === expectedPoints)
  const replay = webhook('payment.captured', rzp.payments.get(proof1.razorpayPaymentId))
  check('webhook for the same payment → 200, no change', (await postWebhook(replay.raw, replay.sig)).status === 200 && (await shopper.get('/api/auth/me')).data.user.points === expectedPoints)
  check('"new order" email sent exactly once', (await eventually(() => notices('order.placed', o1.orderNumber))) === 1 && (await sleep(500), await notices('order.placed', o1.orderNumber)) === 1)
  check('paid order now visible to the customer', (await shopper.get('/api/orders')).data.orders.some((o) => o.id === o1.id))
  check('stock stays taken after payment', (await stock(vA.id)) === stockA - 1)

  console.log('\nClosing the payment window')
  const code = `RZP${stamp}`.toUpperCase().slice(0, 20)
  await admin.post('/api/admin/coupons', { code, type: 'fixed', value: 5, minPurchase: 0, description: 'rzp smoke', expiresAt: null, active: true, usageLimit: 1 })
  const stockB = await stock(vB.id)
  const p2 = await anon.post('/api/orders', orderBody(vB, { couponCode: code }))
  check('order with a single-use code held', p2.status === 201 && p2.data.order.discount === 5, p2.data)
  const usedHeld = (await sql('SELECT used_count FROM coupons WHERE code = $1', [code]))[0].used_count
  const c2 = await anon.post(`/api/orders/${p2.data.order.id}/payment/cancel`, { razorpayOrderId: p2.data.payment.razorpayOrderId })
  check('cancel → released', c2.status === 200 && c2.data.result === 'released', c2.data)
  check('stock given back at once', (await stock(vB.id)) === stockB)
  check('code use given back', usedHeld === 1 && (await sql('SELECT used_count FROM coupons WHERE code = $1', [code]))[0].used_count === 0)
  check('order cancelled and never paid', (await orderRow(p2.data.order.id)).status === 'cancelled')
  check('"unpaid checkout" email sent', (await eventually(() => notices('payment.checkout_abandoned', p2.data.order.orderNumber))) === 1)
  const c2wrong = await anon.post(`/api/orders/${o1.id}/payment/cancel`, { razorpayOrderId: 'order_000000000000' })
  check('cancel needs the matching Razorpay order → 404', c2wrong.status === 404, c2wrong.status)
  const c2paid = await anon.post(`/api/orders/${o1.id}/payment/cancel`, { razorpayOrderId: p1.data.payment.razorpayOrderId })
  check('cancel on a paid order changes nothing', c2paid.data.result === 'paid' && (await orderRow(o1.id)).status === 'placed', c2paid.data)

  const p3 = await anon.post('/api/orders', orderBody(vC))
  pay(p3.data.payment.razorpayOrderId, { status: 'captured' })
  const c3 = await anon.post(`/api/orders/${p3.data.order.id}/payment/cancel`, { razorpayOrderId: p3.data.payment.razorpayOrderId })
  check('window closed after the money was taken → order placed, not released', c3.data.result === 'paid' && (await orderRow(p3.data.order.id)).status === 'placed', c3.data)

  console.log('\nPayments that do not match')
  const p4 = await anon.post('/api/orders', orderBody(vD))
  const { proof: proof4 } = pay(p4.data.payment.razorpayOrderId, { amount: 100 })
  const m4 = await anon.post(`/api/orders/${p4.data.order.id}/payment`, proof4)
  check('wrong amount → not confirmed, order still pending', m4.status === 200 && m4.data.confirmed === false && (await orderRow(p4.data.order.id)).status === 'pending_payment', m4.data)
  check('store emailed about the mismatch', (await eventually(() => notices('payment.mismatch', p4.data.order.orderNumber))) === 1)
  const c4 = await anon.post(`/api/orders/${p4.data.order.id}/payment/cancel`, { razorpayOrderId: p4.data.payment.razorpayOrderId })
  check('a mismatched payment keeps the hold for a person to check', c4.data.result === 'pending' && (await orderRow(p4.data.order.id)).status === 'pending_payment', c4.data)

  console.log('\nRazorpay unavailable when starting')
  const stockE = await stock(vE.id)
  rzp.failNextOrder = true
  const p5 = await anon.post('/api/orders', orderBody(vE))
  check('Razorpay error → 502 with a clear message', p5.status === 502 && /nothing was charged/.test(p5.data.error), p5.data)
  check('stock given back after the failed start', (await stock(vE.id)) === stockE)

  console.log('\nWebhook')
  const p6 = await anon.post('/api/orders', orderBody(vE))
  const { payment: pay6 } = pay(p6.data.payment.razorpayOrderId, { status: 'captured' })
  const w6 = webhook('payment.captured', pay6)
  check('bad webhook signature → 401', (await postWebhook(w6.raw, 'b'.repeat(64))).status === 401)
  check('webhook signed for a different body → 401', (await postWebhook(w6.raw.replace('captured', 'failed'), w6.sig)).status === 401)
  check('webhook payment.captured → 200', (await postWebhook(w6.raw, w6.sig)).status === 200)
  check('…places the order without the browser', (await orderRow(p6.data.order.id)).status === 'placed')
  const stranger = webhook('payment.captured', { ...pay6, id: 'pay_someoneelse01', order_id: 'order_notthisshop01' })
  check('event for another app’s order → 200, ignored', (await postWebhook(stranger.raw, stranger.sig)).status === 200)
  const refundRaw = JSON.stringify({ event: 'refund.processed', payload: { refund: { entity: { amount: pay6.amount, status: 'processed' } }, payment: { entity: { ...pay6, status: 'refunded', amount_refunded: pay6.amount } } } })
  const refundSig = createHmac('sha256', WEBHOOK_SECRET).update(refundRaw).digest('hex')
  check('refund.processed (full) → 200', (await postWebhook(refundRaw, refundSig)).status === 200)
  check('…marks the order refunded', (await orderRow(p6.data.order.id)).payment_status === 'refunded')
  check('…and emails the store', (await eventually(() => notices('order.refunded', p6.data.order.orderNumber))) === 1)

  console.log('\nAdmin')
  const p7 = await anon.post('/api/orders', orderBody(vF))
  const list = await admin.get('/api/admin/orders?status=pending_payment')
  check('admin can filter orders awaiting payment', list.data.orders.some((o) => o.id === p7.data.order.id))
  const ship = await admin.patch(`/api/admin/orders/${p7.data.order.id}`, { status: 'confirmed' })
  check('admin cannot confirm an unpaid online order → 409', ship.status === 409, ship.data)
  const markPaid = await admin.patch(`/api/admin/orders/${p7.data.order.id}`, { paymentStatus: 'paid' })
  check('admin cannot mark it paid by hand → 409', markPaid.status === 409, markPaid.status)
  const stockF = await stock(vF.id)
  const cancel7 = await admin.patch(`/api/admin/orders/${p7.data.order.id}`, { status: 'cancelled' })
  check('admin can cancel it, stock back', cancel7.status === 200 && (await stock(vF.id)) === stockF + 1)
  const stats = (await admin.get('/api/admin/stats')).data.stats
  const [{ revenue }] = await sql(`SELECT coalesce(sum(total) FILTER (WHERE status NOT IN ('cancelled', 'pending_payment')), 0)::float8 AS revenue FROM orders`)
  check('dashboard revenue leaves out unpaid online orders', Math.abs(stats.revenue - revenue) < 0.001, { stats: stats.revenue, revenue })

  console.log('\nHolds that run out (sweep)')
  const stockC = await stock(vC.id)
  const p8 = await anon.post('/api/orders', orderBody(vC))
  const p9 = await anon.post('/api/orders', orderBody(vC))
  pay(p9.data.payment.razorpayOrderId, { status: 'authorized' })
  await sql(`UPDATE orders SET placed_at = now() - interval '31 minutes' WHERE id = ANY($1)`, [[p8.data.order.id, p9.data.order.id]])
  // The sweep runs at most once a minute per server instance, after other requests.
  console.log('    (waiting 61 s for the sweep window)')
  await sleep(61_000)
  await admin.get('/admin/orders')
  const s8 = await eventually(async () => (await orderRow(p8.data.order.id)).status === 'cancelled', 15000)
  check('unpaid order past 30 minutes → cancelled', s8, await orderRow(p8.data.order.id))
  const s9 = await eventually(async () => (await orderRow(p9.data.order.id)).status === 'placed', 15000)
  check('…but one Razorpay authorised is captured and placed instead', s9, await orderRow(p9.data.order.id))
  check('stock: one piece back, one sold', (await stock(vC.id)) === stockC - 1)

  console.log('\nPayment arriving after the hold ran out')
  const { payment: late8 } = pay(p8.data.payment.razorpayOrderId, { status: 'captured' })
  const wl = webhook('payment.captured', late8)
  await postWebhook(wl.raw, wl.sig)
  check('pieces still in stock → order reinstated and placed', (await orderRow(p8.data.order.id)).status === 'placed')
  check('store told about the late payment', (await eventually(() => notices('payment.late_reinstated', p8.data.order.orderNumber))) === 1)
  const p10 = await anon.post('/api/orders', orderBody(vD))
  await anon.post(`/api/orders/${p10.data.order.id}/payment/cancel`, { razorpayOrderId: p10.data.payment.razorpayOrderId })
  const savedD = await stock(vD.id)
  await sql('UPDATE variants SET inventory = 0 WHERE id = $1', [vD.id])
  const { proof: late10 } = pay(p10.data.payment.razorpayOrderId, { status: 'captured' })
  const r10 = await anon.post(`/api/orders/${p10.data.order.id}/payment`, late10)
  check('sold out meanwhile → stays cancelled, payment recorded, refund due', r10.data.refundDue === true && (await orderRow(p10.data.order.id)).status === 'cancelled' && (await orderRow(p10.data.order.id)).payment_status === 'paid', r10.data)
  check('store told to refund it', (await eventually(() => notices('payment.refund_needed', p10.data.order.orderNumber))) === 1)
  await sql('UPDATE variants SET inventory = $2 WHERE id = $1', [vD.id, savedD])

  console.log('\nCash on delivery alongside online payment')
  const cod = await anon.post('/api/orders', { ...orderBody(vA), paymentMethod: 'cod' })
  check('COD order still placed straight away', cod.status === 201 && cod.data.order.status === 'placed' && !cod.data.payment, cod.data)
  await setCommerce({ onlinePaymentsEnabled: true, codEnabled: false })
  check('COD refused when only online is on', (await anon.post('/api/orders', { ...orderBody(vA), paymentMethod: 'cod' })).status === 400)
  const onlyOnline = await anon.post('/api/orders', orderBody(vA))
  check('online still works when COD is off', onlyOnline.status === 201, onlyOnline.status)
  await anon.post(`/api/orders/${onlyOnline.data.order.id}/payment/cancel`, { razorpayOrderId: onlyOnline.data.payment.razorpayOrderId })

  await setCommerce({})
  const restored = (await admin.get('/api/admin/settings')).data.settings.commerce
  check('commerce settings restored', JSON.stringify(restored) === JSON.stringify(original), { restored, original })
}

main()
  .catch((err) => {
    console.error(err)
    failures++
  })
  .finally(async () => {
    mock.close()
    await db.end()
    console.log(`\n${passes} passed, ${failures} failed`)
    process.exit(failures ? 1 : 0)
  })
