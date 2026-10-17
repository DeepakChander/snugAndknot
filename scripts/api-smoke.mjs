#!/usr/bin/env node
/**
 * End-to-end smoke test for the Snug&Knot API.
 *
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/api-smoke.mjs
 *
 * It creates real rows (a customer, orders, a review, a product, a coupon …) and cleans
 * up what it can, so point it at a development or staging database — not production.
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

// Each run gets its own client IP so per-IP rate limits from earlier runs do not interfere.
// (On Vercel the platform sets this header itself; a client cannot choose it there.)
const RUN_IP = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
const COOKIE_RE = /^(__Host-)?sk_session=/
let cookieName = 'sk_session'

class Client {
  constructor(name, ip = RUN_IP) {
    this.name = name
    this.ip = ip
    this.cookie = ''
  }
  async req(method, path, body, extraHeaders = {}) {
    const headers = { Origin: BASE, 'X-Real-IP': this.ip, ...extraHeaders }
    if (this.cookie) headers.Cookie = this.cookie
    let payload
    if (body instanceof FormData) payload = body
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' })
    const set = res.headers.getSetCookie?.() ?? []
    for (const c of set) {
      const [pair] = c.split(';')
      if (COOKIE_RE.test(pair)) {
        cookieName = pair.split('=')[0]
        this.cookie = pair.endsWith('=') ? '' : pair
      }
    }
    const type = res.headers.get('content-type') || ''
    const data = type.includes('json') ? await res.json() : await res.arrayBuffer()
    return { status: res.status, data, headers: res.headers }
  }
  get = (p) => this.req('GET', p)
  post = (p, b, h) => this.req('POST', p, b, h)
  put = (p, b) => this.req('PUT', p, b)
  patch = (p, b) => this.req('PATCH', p, b)
  del = (p) => this.req('DELETE', p)
}

const stamp = Date.now().toString(36)
const anon = new Client('anon')
const shopper = new Client('shopper')
const admin = new Client('admin')
const shopperEmail = `shopper-${stamp}@example.com`

const address = {
  firstName: 'Ada',
  lastName: 'Loom',
  line1: '1 Weaver Lane',
  city: 'Brooklyn',
  state: 'NY',
  postalCode: '11201',
  country: 'United States',
  phone: '+1 555 0100',
}

async function main() {
  console.log(`\nSnug&Knot API smoke test → ${BASE}\n`)

  console.log('Catalogue')
  const list = await anon.get('/api/products')
  check('GET /api/products → 200', list.status === 200, list.status)
  const products = list.data.products ?? []
  check('catalogue has products', products.length >= 1, products.length)
  const cardigan = products.find((p) => p.handle === 'ivory-cable-knit-cardigan') ?? products[0]
  check('products carry variants with inventory', cardigan?.variants?.length > 0 && typeof cardigan.variants[0].inventory === 'number')
  const search = await anon.get('/api/products?q=cardigan')
  check('search filters by keyword', search.status === 200 && search.data.products.every((p) => /cardigan/i.test(p.title + p.description + p.tags.join(' '))))

  console.log('\nAuth')
  const signup = await shopper.post('/api/auth/signup', { name: 'Ada Loom', email: shopperEmail, password: 'knit-and-purl-9' })
  check('signup → 201 with session cookie', signup.status === 201 && !!shopper.cookie, signup.data)
  check('signup grants 100 welcome points', signup.data.user?.points === 100, signup.data.user)
  const dup = await anon.post('/api/auth/signup', { name: 'Dup', email: shopperEmail, password: 'whatever-123' })
  check('duplicate signup → 409', dup.status === 409, dup.status)
  const bad = await anon.post('/api/auth/signup', { name: '', email: 'nope', password: '1' })
  check('invalid signup → 422 with field errors', bad.status === 422 && bad.data.fields?.email, bad.data)
  const wrong = await anon.post('/api/auth/login', { email: shopperEmail, password: 'wrong-password' })
  check('wrong password → 401', wrong.status === 401, wrong.status)
  const me = await shopper.get('/api/auth/me')
  check('GET /api/auth/me returns the signed-in user', me.data.user?.email === shopperEmail, me.data)
  const forged = await new Client('forged').req('GET', '/api/auth/me', undefined, { Cookie: `${cookieName}=eyJzdWIiOiJ4Iiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJ2IjowfQ.AAAA` })
  check('forged session cookie is rejected', forged.data.user === null, forged.data)

  console.log('\nCart pricing (server-side)')
  const v1 = cardigan.variants.find((v) => v.inventory > 2)
  const other = products.find((p) => p.id !== cardigan.id)
  const v2 = other.variants.find((v) => v.inventory > 2)
  const q1 = await anon.post('/api/cart/quote', { lines: [{ variantId: v1.id, quantity: 1 }, { variantId: v2.id, quantity: 2 }] })
  const expectedSubtotal = Math.round((v1.price + v2.price * 2) * 100) / 100
  check('quote subtotal uses database prices', q1.data.quote?.subtotal === expectedSubtotal, { got: q1.data.quote?.subtotal, expectedSubtotal })
  const q2 = await anon.post('/api/cart/quote', { lines: [{ variantId: v1.id, quantity: 1 }], couponCode: 'welcome10' })
  check('WELCOME10 takes 10% off (case-insensitive)', q2.data.quote?.discount === Math.round(v1.price * 10) / 100, q2.data.quote)
  const q3 = await anon.post('/api/cart/quote', { lines: [{ variantId: v1.id, quantity: 1 }], couponCode: 'SNUG20' })
  check('expired coupon is refused with a reason', q3.data.quote?.couponError?.includes('expired'), q3.data.quote?.couponError)
  const q4 = await anon.post('/api/cart/quote', { lines: [{ variantId: v1.id, quantity: 1 }], couponCode: 'NOPE' })
  check('unknown coupon is refused', !!q4.data.quote?.couponError && q4.data.quote.discount === 0)
  const q5 = await anon.post('/api/cart/quote', { lines: [{ variantId: 'does-not-exist', quantity: 1 }] })
  check('unknown variant is dropped with an issue', q5.data.quote?.lines.length === 0 && q5.data.quote.issues.length === 1, q5.data.quote)

  console.log('\nCheckout')
  const order = await shopper.post('/api/orders', {
    lines: [{ variantId: v1.id, quantity: 1 }, { variantId: v2.id, quantity: 2 }],
    couponCode: 'WELCOME10',
    shippingMethod: 'standard',
    email: shopperEmail,
    address,
    paymentMethod: 'cod',
  })
  check('place order → 201', order.status === 201, order.data)
  const placed = order.data.order
  check('order number assigned', /^SK-\d{4}-\d{5}$/.test(placed?.orderNumber ?? ''), placed?.orderNumber)
  check('order total = subtotal - discount + shipping + tax', placed && Math.abs(placed.subtotal - placed.discount + placed.shipping + placed.tax - placed.total) < 0.01, placed)
  check('loyalty points earned for signed-in customer', placed?.pointsEarned === Math.floor(placed?.total ?? 0), placed?.pointsEarned)
  const after = (await anon.get('/api/products')).data.products.find((p) => p.id === cardigan.id)
  check('inventory decremented by the order', after.variants.find((v) => v.id === v1.id).inventory === v1.inventory - 1)
  const tamper = await shopper.post('/api/orders', {
    lines: [{ variantId: v1.id, quantity: 1, price: 0.01 }],
    shippingMethod: 'standard',
    email: shopperEmail,
    address,
    paymentMethod: 'cod',
  })
  check('client-sent prices are ignored', tamper.status === 201 && tamper.data.order.subtotal === v1.price, tamper.data.order?.subtotal)
  const guest = await anon.post('/api/orders', {
    lines: [{ variantId: v2.id, quantity: 1 }],
    shippingMethod: 'express',
    email: `guest-${stamp}@example.com`,
    address,
    paymentMethod: 'cod',
  })
  check('guest checkout works (express shipping charged)', guest.status === 201 && guest.data.order.shipping > 0, guest.data)
  const lookup = await anon.post('/api/orders/lookup', { orderNumber: guest.data.order?.orderNumber, email: `guest-${stamp}@example.com` })
  check('guest order lookup by number + email', lookup.status === 200 && lookup.data.order.id === guest.data.order.id, lookup.status)
  const lookupWrong = await anon.post('/api/orders/lookup', { orderNumber: guest.data.order?.orderNumber, email: 'someone-else@example.com' })
  check('lookup with the wrong email → 404', lookupWrong.status === 404, lookupWrong.status)
  const mine = await shopper.get('/api/orders')
  check('customer sees their orders', mine.data.orders?.length >= 2, mine.data.orders?.length)
  const othersOrder = await shopper.get(`/api/orders/${guest.data.order?.id}`)
  check("customer cannot read someone else's order", othersOrder.status === 404, othersOrder.status)
  const noBag = await anon.post('/api/orders', { lines: [], shippingMethod: 'standard', email: 'x@example.com', address, paymentMethod: 'cod' })
  check('empty bag → 422', noBag.status === 422, noBag.status)

  console.log('\nReviews & ratings')
  const anonReview = await anon.post(`/api/products/${cardigan.handle}/reviews`, { rating: 5, title: 'Lovely', body: 'Beautiful knit, very warm.' })
  check('review requires sign-in → 401', anonReview.status === 401, anonReview.status)
  const review = await shopper.post(`/api/products/${cardigan.handle}/reviews`, { rating: 4, title: 'Heirloom quality', body: 'The cable pattern is gorgeous and it washes well.', fit: 'true' })
  check('signed-in review → 201', review.status === 201, review.data)
  check('an order not yet delivered does not make the review "verified"', review.data.review?.verified === false, review.data.review)
  const reviewDup = await shopper.post(`/api/products/${cardigan.handle}/reviews`, { rating: 5, title: 'Again', body: 'Trying to review twice here.' })
  check('one review per customer per product → 409', reviewDup.status === 409, reviewDup.status)
  const badReview = await shopper.post(`/api/products/${other.handle}/reviews`, { rating: 9, title: '', body: 'short' })
  check('invalid review → 422', badReview.status === 422, badReview.status)

  console.log('\nAdmin access control')
  const anonAdmin = await anon.get('/api/admin/stats')
  check('anonymous → 401 on admin API', anonAdmin.status === 401, anonAdmin.status)
  const custAdmin = await shopper.get('/api/admin/stats')
  check('customer → 403 on admin API', custAdmin.status === 403, custAdmin.status)
  const adminLogin = await admin.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  check('admin login (env credentials) → admin role', adminLogin.status === 200 && adminLogin.data.user?.role === 'admin', adminLogin.data)
  const stats = await admin.get('/api/admin/stats')
  check('dashboard stats load', stats.status === 200 && stats.data.stats.orders >= 3, stats.data)
  check('pending review counted on dashboard', stats.data.stats?.pendingReviews >= 1)

  console.log('\nModeration → live rating')
  const pending = await admin.get('/api/admin/reviews?status=pending')
  const mineReview = pending.data.reviews?.find((r) => r.id === review.data.review?.id)
  check('admin sees the pending review', !!mineReview)
  const beforeRating = (await anon.get(`/api/products/${cardigan.handle}/reviews`)).data
  check('pending review is not public yet', !beforeRating.reviews.some((r) => r.id === review.data.review?.id))
  const approve = await admin.patch(`/api/admin/reviews/${review.data.review?.id}`, { status: 'approved', adminReply: 'Thank you, Ada!' })
  check('approve review → 200', approve.status === 200, approve.data)
  const afterRating = (await anon.get(`/api/products/${cardigan.handle}/reviews`)).data
  check('approved review is public with reply', afterRating.reviews.some((r) => r.id === review.data.review?.id && r.adminReply === 'Thank you, Ada!'))
  check('rating summary recalculated', afterRating.summary.count >= 1 && afterRating.summary.distribution[3] >= 1, afterRating.summary)
  const ratedProduct = (await anon.get('/api/products')).data.products.find((p) => p.id === cardigan.id)
  check('product card rating reflects approved reviews', ratedProduct.reviewCount === afterRating.summary.count && ratedProduct.rating === afterRating.summary.average, { card: [ratedProduct.rating, ratedProduct.reviewCount], summary: afterRating.summary })
  const helpful = await anon.post(`/api/reviews/${review.data.review?.id}/helpful`)
  check('mark review helpful', helpful.status === 200 && helpful.data.helpful === 1, helpful.data)
  // A real review the owner received elsewhere: needs the customer's agreement, is live at once,
  // says where it came from and is never verified.
  const received = { productId: cardigan.id, author: 'Priya S.', rating: 5, title: '', body: 'Loved the cardigan, the fit is perfect and it is so soft.', source: 'whatsapp', receivedOn: '2026-10-01' }
  const noConsent = await admin.post('/api/admin/reviews', received)
  check('received review without the customer\'s agreement refused → 422', noConsent.status === 422 && !!noConsent.data.fields?.consent, noConsent.data)
  const anonAdd = await anon.post('/api/admin/reviews', { ...received, consent: true })
  check('only an admin can add a received review', anonAdd.status === 401 || anonAdd.status === 403, anonAdd.status)
  const added = await admin.post('/api/admin/reviews', { ...received, consent: true })
  check('received review added → 201, approved, unverified, from WhatsApp', added.status === 201 && added.data.review?.status === 'approved' && added.data.review?.verified === false && added.data.review?.source === 'whatsapp' && added.data.review?.createdAt?.startsWith('2026-10-01'), added.data)
  const withReceived = (await anon.get(`/api/products/${cardigan.handle}/reviews`)).data
  check('…and it is public on the piece', withReceived.reviews.some((r) => r.id === added.data.review?.id && r.source === 'whatsapp'), null)
  let pageHtml = ''
  for (let i = 0; i < 10 && !pageHtml.includes('Shared via WhatsApp'); i++) {
    pageHtml = new TextDecoder().decode((await anon.get(`/product/${cardigan.handle}`)).data)
    if (!pageHtml.includes('Shared via WhatsApp')) await new Promise((r) => setTimeout(r, 500))
  }
  check('…labelled Shared via WhatsApp on the product page', pageHtml.includes('Shared via WhatsApp'), null)
  const ld = [...pageHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ')
  check('…and kept out of the search-engine review markup', ld.length > 0 && !ld.includes('Loved the cardigan'), null)
  const futureDate = await admin.post('/api/admin/reviews', { ...received, consent: true, receivedOn: '2999-01-01' })
  check('received review dated in the future refused → 422', futureDate.status === 422, futureDate.status)
  if (added.data.review?.id) await admin.del(`/api/admin/reviews/${added.data.review.id}`)

  console.log('\nAdmin: products')
  const full = (await admin.get(`/api/admin/products/${cardigan.id}`)).data.product
  const editable = {
    handle: full.handle,
    title: full.title,
    description: full.description,
    details: full.details,
    vendor: full.vendor,
    productType: full.productType,
    gender: full.gender,
    category: full.category,
    tags: full.tags,
    price: full.price,
    compareAtPrice: full.compareAtPrice,
    images: full.images,
    colors: full.colors,
    featured: full.featured,
    isNew: full.isNew,
    bestseller: full.bestseller,
    status: full.status,
    seoTitle: full.seoTitle,
    seoDescription: full.seoDescription,
    variants: full.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, size: v.size, color: v.color, price: v.price, compareAtPrice: v.compareAtPrice, inventory: v.inventory })),
  }
  const edited = await admin.put(`/api/admin/products/${cardigan.id}`, { ...editable, title: `${full.title} (edited)`, tags: [...full.tags, 'smoke'] })
  check('edit product title + tags → 200', edited.status === 200 && edited.data.product.title.endsWith('(edited)'), edited.data)
  const live = (await anon.get('/api/products')).data.products.find((p) => p.id === cardigan.id)
  check('edit is visible on the storefront API immediately', live.title.endsWith('(edited)'), live.title)
  const restored = await admin.put(`/api/admin/products/${cardigan.id}`, editable)
  check('restore original product', restored.status === 200 && restored.data.product.title === full.title)
  const badPrice = await admin.put(`/api/admin/products/${cardigan.id}`, { ...editable, compareAtPrice: 1 })
  check('compare-at below price → 422', badPrice.status === 422, badPrice.data)
  const newProduct = {
    ...editable,
    handle: `smoke-test-${stamp}`,
    title: `Smoke Test Scarf ${stamp}`,
    status: 'draft',
    variants: [{ sku: `SMOKE-${stamp}-OS`, size: 'One Size', color: 'Oat', price: 79, compareAtPrice: null, inventory: 3 }],
    price: 79,
    compareAtPrice: null,
  }
  const created = await admin.post('/api/admin/products', newProduct)
  check('create product → 201', created.status === 201, created.data)
  const dupHandle = await admin.post('/api/admin/products', { ...newProduct, variants: [{ ...newProduct.variants[0], sku: `SMOKE-${stamp}-2` }] })
  check('duplicate handle → 409', dupHandle.status === 409, dupHandle.data)
  const draftHidden = (await anon.get('/api/products')).data.products.some((p) => p.handle === newProduct.handle)
  check('draft product hidden from storefront', !draftHidden)
  const removed = await admin.del(`/api/admin/products/${created.data.product?.id}`)
  check('delete product → 200', removed.status === 200, removed.status)

  console.log('\nAdmin: orders, cancellation & returns')
  const shipped = await admin.patch(`/api/admin/orders/${placed.id}`, { status: 'shipped', trackingNumber: '1Z999AA10123456784' })
  check('mark order shipped with tracking', shipped.status === 200 && shipped.data.order.shippedAt && shipped.data.order.trackingNumber, shipped.data)
  const earlyReturn = await shopper.post('/api/returns', { orderId: placed.id, items: [{ orderItemId: placed.items[0].id, quantity: 1 }], reason: 'wrong-size' })
  check('return refused before delivery', earlyReturn.status === 400, earlyReturn.data)
  const delivered = await admin.patch(`/api/admin/orders/${placed.id}`, { status: 'delivered' })
  check('mark delivered → COD marked paid', delivered.data.order?.paymentStatus === 'paid', delivered.data.order)
  const pointsDelivered = (await shopper.get('/api/auth/me')).data.user.points
  check('loyalty points are given on delivery, not before', !placed.pointsGranted && delivered.data.order?.pointsGranted === true && pointsDelivered === signup.data.user.points + placed.pointsEarned, { pointsDelivered, earned: placed.pointsEarned })
  const redeliver = await admin.patch(`/api/admin/orders/${placed.id}`, { status: 'delivered', trackingNumber: '1Z999AA10123456784' })
  check('…and only once', redeliver.status === 200 && (await shopper.get('/api/auth/me')).data.user.points === pointsDelivered)
  const verifiedReview = await shopper.post(`/api/products/${other.handle}/reviews`, { rating: 5, title: 'Worth the wait', body: 'Arrived well packed and fits perfectly.', fit: 'true' })
  check('a delivered order makes the review "verified"', verifiedReview.status === 201 && verifiedReview.data.review?.verified === true, verifiedReview.data)
  const ret = await shopper.post('/api/returns', { orderId: placed.id, items: [{ orderItemId: placed.items[0].id, quantity: 1 }], reason: 'wrong-size', comments: 'Need a size up' })
  check('customer return request → 201', ret.status === 201, ret.data)
  const overReturn = await shopper.post('/api/returns', { orderId: placed.id, items: [{ orderItemId: placed.items[0].id, quantity: 1 }], reason: 'wrong-size' })
  check('cannot return more than was bought', overReturn.status === 400, overReturn.data)
  const retAdmin = await admin.patch(`/api/admin/returns/${ret.data.return?.id}`, { status: 'approved' })
  check('admin approves return', retAdmin.status === 200, retAdmin.status)
  const pointsBefore = (await shopper.get('/api/auth/me')).data.user.points
  const tamperOrder = tamper.data.order
  const invBefore = (await anon.get('/api/products')).data.products.find((p) => p.id === cardigan.id).variants.find((v) => v.id === v1.id).inventory
  const cancel = await admin.patch(`/api/admin/orders/${tamperOrder.id}`, { status: 'cancelled' })
  check('cancel order → 200', cancel.status === 200 && cancel.data.order.status === 'cancelled', cancel.data)
  const invAfter = (await anon.get('/api/products')).data.products.find((p) => p.id === cardigan.id).variants.find((v) => v.id === v1.id).inventory
  check('cancellation restocks inventory', invAfter === invBefore + 1, { invBefore, invAfter })
  const pointsAfter = (await shopper.get('/api/auth/me')).data.user.points
  check('cancelling an undelivered order changes no points (none were given)', pointsAfter === pointsBefore && tamperOrder.pointsGranted === false, { pointsBefore, pointsAfter })
  const reopen = await admin.patch(`/api/admin/orders/${tamperOrder.id}`, { status: 'placed' })
  check('cancelled order cannot be reopened → 409', reopen.status === 409, reopen.status)

  console.log('\nAdmin: coupons, collections, categories, settings')
  const code = `SMK${stamp.toUpperCase()}`.slice(0, 20)
  const cp = await admin.post('/api/admin/coupons', { code, type: 'fixed', value: 5, minPurchase: 0, description: 'smoke', expiresAt: null, active: true, usageLimit: 1 })
  check('create coupon → 201', cp.status === 201, cp.data)
  const cpBad = await admin.post('/api/admin/coupons', { code: `${code}X`, type: 'percentage', value: 150 })
  check('percentage over 100 → 422', cpBad.status === 422, cpBad.data)
  await anon.post('/api/orders', { lines: [{ variantId: v2.id, quantity: 1 }], couponCode: code, shippingMethod: 'standard', email: `limit-${stamp}@example.com`, address, paymentMethod: 'cod' })
  const limitQuote = await anon.post('/api/cart/quote', { lines: [{ variantId: v2.id, quantity: 1 }], couponCode: code })
  check('usage limit enforced after one use', /usage limit/.test(limitQuote.data.quote?.couponError ?? ''), limitQuote.data.quote?.couponError)
  check('delete coupon', (await admin.del(`/api/admin/coupons/${code}`)).status === 200)
  const cols = (await admin.get('/api/admin/collections')).data.collections
  const col = cols[0]
  const colEdit = await admin.put(`/api/admin/collections/${col.id}`, { ...col, subtitle: 'Edited by smoke test' })
  check('edit collection', colEdit.status === 200 && colEdit.data.collection.subtitle === 'Edited by smoke test', colEdit.data)
  await admin.put(`/api/admin/collections/${col.id}`, col)
  const catDel = await admin.del('/api/admin/categories/women-knitwear')
  check('category in use cannot be deleted → 409', catDel.status === 409, catDel.data)
  await categoryGridChecks()
  await departmentChecks()
  const settings = (await admin.get('/api/admin/settings')).data.settings
  const ann = await admin.put('/api/admin/settings', { section: 'announcement', value: { ...settings.announcement, messages: ['Smoke test banner'] } })
  check('save announcement settings', ann.status === 200 && ann.data.value.messages[0] === 'Smoke test banner', ann.data)
  const annBad = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, currency: 'dollars' } })
  check('invalid commerce settings → 422', annBad.status === 422, annBad.data)
  await admin.put('/api/admin/settings', { section: 'announcement', value: settings.announcement })
  const ship = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, freeShippingThreshold: 10000 } })
  const shipQuote = await anon.post('/api/cart/quote', { lines: [{ variantId: v1.id, quantity: 1 }] })
  check('commerce settings drive checkout shipping', ship.status === 200 && shipQuote.data.quote.shipping === settings.commerce.standardShippingRate, shipQuote.data.quote)
  await admin.put('/api/admin/settings', { section: 'commerce', value: settings.commerce })

  console.log('\nInbox: newsletter, contact, stock alerts, media')
  const sub = await anon.post('/api/newsletter', { email: `news-${stamp}@example.com`, source: 'smoke' })
  check('newsletter subscribe', sub.status === 200 && sub.data.created === true, sub.data)
  const sub2 = await anon.post('/api/newsletter', { email: `NEWS-${stamp}@example.com` })
  check('duplicate subscribe is idempotent', sub2.data.created === false, sub2.data)
  const msg = await anon.post('/api/contact', { name: 'Smoke', email: `c-${stamp}@example.com`, subject: 'Hello', message: 'A message from the smoke test.' })
  check('contact message stored', msg.status === 201, msg.data)
  const inbox = (await admin.get('/api/admin/messages')).data.messages
  const m = inbox.find((x) => x.email === `c-${stamp}@example.com`)
  check('admin sees the message', !!m)
  check('mark message read', (await admin.patch(`/api/admin/messages/${m?.id}`, { status: 'read' })).status === 200)
  check('delete message', (await admin.del(`/api/admin/messages/${m?.id}`)).status === 200)
  const alert = await anon.post('/api/stock-alerts', { productId: cardigan.id, variantId: v1.id, email: `alert-${stamp}@example.com` })
  check('back-in-stock alert stored', alert.status === 201, alert.data)
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
  const fd = new FormData()
  fd.append('file', new Blob([png], { type: 'image/png' }), 'pixel.png')
  const up = await admin.post('/api/admin/media', fd)
  check('upload image → 201', up.status === 201 && up.data.url, up.data)
  const img = await anon.get(up.data.url)
  check('uploaded image served with its bytes', img.status === 200 && img.data.byteLength === png.length && img.headers.get('content-type') === 'image/png')
  check('delete image', (await admin.del(`/api/admin/media/${up.data.id}`)).status === 200)
  const fdBad = new FormData()
  fdBad.append('file', new Blob(['<svg/>'], { type: 'image/svg+xml' }), 'x.svg')
  check('SVG upload refused (XSS risk) → 415', (await admin.post('/api/admin/media', fdBad)).status === 415)

  console.log('\nSecurity')
  const csrf = await admin.post('/api/admin/coupons', { code: 'EVIL', type: 'fixed', value: 99 }, { Origin: 'https://evil.example' })
  check('cross-site write blocked → 403', csrf.status === 403, csrf.status)
  const demote = await admin.patch(`/api/admin/customers/${adminLogin.data.user?.id}`, { role: 'customer' })
  check('admin cannot remove their own admin role', demote.status === 400, demote.status)
  await securityChecks({ placed, guest: guest.data.order, cardigan, v1, settings })
  const logout = await shopper.post('/api/auth/logout')
  check('logout clears the session', logout.status === 200 && !shopper.cookie)

  console.log(`\n${passes} passed, ${failures} failed\n`)
  process.exit(failures ? 1 : 0)
}

/** The home page's "Shop by category" section as HTML, '' when it is not rendered, null when the page failed. */
async function homeCategoryGrid() {
  const res = await fetch(BASE + '/', { headers: { 'X-Real-IP': RUN_IP } })
  if (res.status !== 200) return null
  const html = await res.text()
  const start = html.indexOf('aria-labelledby="category-grid-title"')
  return start === -1 ? '' : html.slice(start, html.indexOf('</section>', start))
}

/** Re-reads the home page until `ok(grid)` holds; a save revalidates the page, which may take a request or two. */
async function waitForHome(ok, tries = 10) {
  let grid = null
  for (let i = 0; i < tries; i++) {
    grid = await homeCategoryGrid()
    if (grid !== null && ok(grid)) return { ok: true, grid }
    await new Promise((r) => setTimeout(r, 500))
  }
  return { ok: false, grid: grid ?? 'home page did not return 200' }
}

async function departmentChecks() {
  console.log('\nDepartments and their categories')
  const page = await anon.get('/shop/men/t-shirts')
  check('a department category has its page at /shop/<department>/<category> → 200', page.status === 200, page.status)
  for (const [from, to] of [['/shop/men-t-shirts', '/shop/men/t-shirts'], ['/shop/tops', '/shop/men/t-shirts'], ['/shop/cardigans', '/shop/women/knitwear']]) {
    const r = await anon.get(from)
    check(`${from} → 308 to ${to}`, r.status === 308 && new URL(r.headers.get('location') ?? '', BASE).pathname === to, { status: r.status, location: r.headers.get('location') })
  }
  check('unknown category in a department → 404', (await anon.get('/shop/men/no-such-thing')).status === 404)
  check('unknown department → 404', (await anon.get('/shop/pets/collars')).status === 404)
  const unprefixed = await admin.post('/api/admin/categories', { slug: 'smoke-shirts', title: 'Shirts', department: 'men' })
  check('a department category needs a slug that starts with the department → 422', unprefixed.status === 422, unprefixed.data)
  const slug = `kids-boys-smoke-${Date.now().toString(36)}`
  const created = await admin.post('/api/admin/categories', { slug, title: 'Smoke tees', department: 'kids', group: 'Boys', showOnHome: false })
  check('admin creates a category in a department and group → 201', created.status === 201 && created.data.category?.department === 'kids' && created.data.category?.group === 'Boys', created.data)
  if (created.status === 201) check('delete the test category', (await admin.del(`/api/admin/categories/${slug}`)).status === 200)

  // Closing a department takes it out of the shop; opening it brings it back.
  const store = (await admin.get('/api/admin/settings')).data.settings.store
  const close = await admin.put('/api/admin/settings', { section: 'store', value: { ...store, departments: { men: true, women: true, kids: false } } })
  check('admin closes the Kids department → 200', close.status === 200 && close.data.value?.departments?.kids === false, close.data)
  let closed = false
  for (let i = 0; i < 10 && !closed; i++) {
    closed = (await anon.get('/shop/kids')).status === 404
    if (!closed) await new Promise((r) => setTimeout(r, 500))
  }
  check('…its page is gone (404)', closed, null)
  check('…and so are its categories (404)', (await anon.get('/shop/kids/boys-t-shirts')).status === 404)
  check('…while Men stays open', (await anon.get('/shop/men')).status === 200)
  const reopen = await admin.put('/api/admin/settings', { section: 'store', value: { ...store, departments: { men: true, women: true, kids: true } } })
  check('admin opens Kids again → 200', reopen.status === 200 && reopen.data.value?.departments?.kids === true, reopen.data)
  let back = false
  for (let i = 0; i < 10 && !back; i++) {
    back = (await anon.get('/shop/kids')).status === 200
    if (!back) await new Promise((r) => setTimeout(r, 500))
  }
  check('…and its page is back (200)', back, null)
}

async function categoryGridChecks() {
  console.log('\nAdmin: home page category grid')
  const cats = (await admin.get('/api/admin/categories')).data.categories
  const original = cats.find((c) => c.slug === 'women-knitwear')
  check('categories carry badge and showOnHome', original && typeof original.badge === 'string' && typeof original.showOnHome === 'boolean', original)
  check('categories carry department, menu group and showInMenu', original?.department === 'women' && original?.group === 'Topwear' && original?.showInMenu === true, original)
  if (!original) return
  const url = '/api/admin/categories/women-knitwear'
  const tile = 'href="/shop/women/knitwear"'
  try {
    const withBadge = await admin.put(url, { ...original, badge: '  3XL TO 6XL  ', showOnHome: true })
    check('admin sets a badge (trimmed) → 200', withBadge.status === 200 && withBadge.data.category?.badge === '3XL TO 6XL' && withBadge.data.category?.showOnHome === true, withBadge.data)
    const shown = await waitForHome((g) => g.includes(tile) && g.includes('3XL TO 6XL'))
    check('home grid shows the category tile with its badge', shown.ok, shown.grid.slice(0, 300))
    const max = await admin.put(url, { ...original, badge: 'X'.repeat(24) })
    check('24-character badge accepted → 200', max.status === 200 && max.data.category?.badge.length === 24, max.data)
    const tooLong = await admin.put(url, { ...original, badge: 'X'.repeat(25) })
    check('badge longer than 24 characters → 422', tooLong.status === 422, tooLong.data)
    const hidden = await admin.put(url, { ...original, badge: '3XL TO 6XL', showOnHome: false })
    check('admin hides a category from the home page → 200', hidden.status === 200 && hidden.data.category?.showOnHome === false, hidden.data)
    const gone = await waitForHome((g) => !g.includes(tile))
    check('hidden category has no tile on the home grid', gone.ok, gone.grid.slice(0, 300))
    const page = await anon.get('/shop/women/knitwear')
    check('hidden category keeps its own page → 200', page.status === 200, page.status)
    const bare = await admin.put(url, { slug: original.slug, title: original.title, description: original.description, image: original.image, position: original.position })
    check('omitted fields fall back to no badge, shown on home', bare.status === 200 && bare.data.category?.badge === '' && bare.data.category?.showOnHome === true, bare.data)
    check('…and the department stays what it was created with', bare.data.category?.department === 'women', bare.data)
    const moved = await admin.put(url, { ...original, department: 'men' })
    // Refused outright (its slug belongs to the old department) or saved with the department unchanged.
    check('a category cannot change department', moved.status === 422 || (moved.status === 200 && moved.data.category?.department === 'women'), moved.data)
  } finally {
    const restore = await admin.put(url, original)
    check('restore the category', restore.status === 200 && restore.data.category?.badge === original.badge && restore.data.category?.showOnHome === original.showOnHome, restore.data)
  }
}

async function securityChecks({ placed, guest, cardigan, settings }) {
  console.log('\nSecurity: headers')
  const home = await fetch(BASE + '/', { redirect: 'manual' })
  const csp = home.headers.get('content-security-policy') ?? ''
  check('CSP sent, framing forbidden, plugins off', csp.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'") && csp.includes("base-uri 'self'"), csp)
  check('X-Frame-Options: DENY', home.headers.get('x-frame-options') === 'DENY')
  check('HSTS sent', /max-age=\d+/.test(home.headers.get('strict-transport-security') ?? ''))
  check('Permissions-Policy sent', (home.headers.get('permissions-policy') ?? '').includes('camera=()'))
  check('framework not advertised (no X-Powered-By)', !home.headers.get('x-powered-by'))
  const meHdr = await anon.get('/api/auth/me')
  check('API responses are not cacheable', meHdr.headers.get('cache-control') === 'no-store', meHdr.headers.get('cache-control'))

  console.log('\nSecurity: admin area')
  const tree = encodeURIComponent(JSON.stringify(['', { children: ['admin', { children: ['(panel)', { children: ['orders', { children: ['__PAGE__', {}, null, null] }, null, null] }, null, null] }, null, null] }, null, null, true]))
  for (const who of [anon, shopper]) {
    const res = await fetch(`${BASE}/admin/orders?_rsc=probe`, { headers: { RSC: '1', 'Next-Router-State-Tree': tree, ...(who.cookie ? { Cookie: who.cookie } : {}) }, redirect: 'manual' })
    const body = await res.text()
    check(`${who.name}: page-only (RSC) request for admin orders leaks nothing`, !body.includes(placed.orderNumber) && !body.includes('Weaver Lane'), { status: res.status, bytes: body.length })
  }
  const adminPage = await fetch(`${BASE}/admin/customers`, { redirect: 'manual' })
  check('anonymous admin page → redirect to sign-in', adminPage.status === 307 && (adminPage.headers.get('location') ?? '').includes('/admin/login'), adminPage.status)
  const custPage = await fetch(`${BASE}/admin/settings`, { headers: { Cookie: shopper.cookie }, redirect: 'manual' })
  check('customer admin page → redirect (denied)', custPage.status === 307 && (custPage.headers.get('location') ?? '').includes('denied'), custPage.status)
  const takeover = await anon.post('/api/auth/signup', { name: 'Not the owner', email: ADMIN_EMAIL, password: 'claiming-it-first-1' })
  check("the owner's ADMIN_EMAIL cannot be registered as a customer", takeover.status === 409, takeover.status)

  console.log('\nSecurity: request forgery & input limits')
  const plain = await fetch(BASE + '/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'text/plain', 'X-Real-IP': RUN_IP }, body: JSON.stringify({ email: `p-${stamp}@example.com` }) })
  check('non-JSON (form-style) body → 415', plain.status === 415, plain.status)
  const sneaky = await fetch(BASE + '/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'text/plain;application/json', 'X-Real-IP': RUN_IP }, body: JSON.stringify({ email: `s-${stamp}@example.com` }) })
  check('text/plain disguised as JSON → 415', sneaky.status === 415, sneaky.status)
  const crossSite = await anon.post('/api/newsletter', { email: `x-${stamp}@example.com` }, { 'Sec-Fetch-Site': 'cross-site' })
  check('browser cross-site request → 403', crossSite.status === 403, crossSite.status)
  const huge = await anon.post('/api/contact', { name: 'Big', email: `b-${stamp}@example.com`, message: 'x'.repeat(1_100_000) })
  check('oversized body → 413', huge.status === 413, huge.status)

  console.log('\nSecurity: rate limits')
  const victim = `nobody-${stamp}@example.com`
  const attacker = new Client('attacker', `10.250.${Math.floor(Math.random() * 250)}.1`)
  let last
  for (let i = 0; i < 11; i++) last = await attacker.post('/api/auth/login', { email: victim, password: `guess-${i}-xyz` })
  check('11th login attempt on one account → 429 with Retry-After', last.status === 429 && Number(last.headers.get('retry-after')) > 0, { status: last.status, retry: last.headers.get('retry-after') })
  for (let i = 0; i < 11; i++) await attacker.post('/api/auth/login', { email: shopperEmail, password: `guess-${i}-xyz` })
  const owner = new Client('owner-elsewhere', `10.251.${Math.floor(Math.random() * 250)}.2`)
  const ownerIn = await owner.post('/api/auth/login', { email: shopperEmail, password: 'knit-and-purl-9' })
  check("an attacker's failed guesses do not lock the real owner out", ownerIn.status === 200, ownerIn.status)

  console.log('\nSecurity: timing does not reveal accounts')
  const timer = new Client('timer', `10.252.${Math.floor(Math.random() * 250)}.3`)
  const time = async (email) => {
    const t = performance.now()
    await timer.post('/api/auth/login', { email, password: 'definitely-wrong-1' })
    return performance.now() - t
  }
  const known = [], unknown = []
  for (let i = 0; i < 3; i++) {
    known.push(await time(shopperEmail))
    unknown.push(await time(`ghost-${stamp}-${i}@example.com`))
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length
  const ratio = avg(unknown) / avg(known)
  check('unknown email takes as long as a wrong password', ratio > 0.6 && ratio < 1.6, { knownMs: Math.round(avg(known)), unknownMs: Math.round(avg(unknown)) })

  console.log('\nSecurity: sessions')
  const stolen = shopper.cookie
  const changed = await shopper.post('/api/account/password', { currentPassword: 'knit-and-purl-9', newPassword: 'purl-and-knit-10' })
  check('password change → 200, this device stays signed in', changed.status === 200 && (await shopper.get('/api/auth/me')).data.user?.email === shopperEmail, changed.data)
  const replay = await new Client('thief').req('GET', '/api/auth/me', undefined, { Cookie: stolen })
  check('a copied cookie stops working after the password change', replay.data.user === null, replay.data)
  const common = await anon.post('/api/auth/signup', { name: 'Weak', email: `weak-${stamp}@example.com`, password: 'password123' })
  check('very common password refused → 422', common.status === 422 && common.data.fields?.password, common.data)
  const promoted = new Client('promoted')
  await promoted.post('/api/auth/signup', { name: 'Promo', email: `promo-${stamp}@example.com`, password: 'promo-knit-55' })
  const promotedId = (await promoted.get('/api/auth/me')).data.user?.id
  const before = promoted.cookie
  await admin.patch(`/api/admin/customers/${promotedId}`, { role: 'admin' })
  const stillIn = await new Client('old').req('GET', '/api/auth/me', undefined, { Cookie: before })
  check('a role change ends existing sessions (no silent upgrade)', stillIn.status === 200 && stillIn.data.user === null, stillIn.data)
  await admin.patch(`/api/admin/customers/${promotedId}`, { role: 'customer' })

  console.log('\nSecurity: who can see what')
  const masked = await anon.post('/api/orders/lookup', { orderNumber: guest.orderNumber, email: guest.email })
  const a = masked.data.order?.shippingAddress ?? {}
  check('guest tracking hides street and phone', masked.status === 200 && a.line1 !== '1 Weaver Lane' && !String(a.phone ?? '').includes('0100'), a)
  check('…and the postal code', masked.status === 200 && a.postalCode !== address.postalCode && String(a.postalCode).startsWith(address.postalCode.slice(0, 2)), a.postalCode)
  const claimer = new Client('claimer')
  await claimer.post('/api/auth/signup', { name: 'Claimer', email: guest.email, password: 'claim-guest-77' })
  const claimed = await claimer.get('/api/orders')
  check("registering a guest's email does not reveal their orders", claimed.status === 200 && !claimed.data.orders.some((o) => o.id === guest.id), claimed.data.orders?.length)
  check("…nor by order id", (await claimer.get(`/api/orders/${guest.id}`)).status === 404)
  await admin.patch(`/api/admin/orders/${placed.id}`, { adminNotes: 'Internal: smoke test note' })
  const custView = await shopper.get(`/api/orders/${placed.id}`)
  check('staff notes never reach the customer', custView.status === 200 && !JSON.stringify(custView.data).includes('Internal: smoke test note'), custView.data.order?.notes)
  const adminView = await admin.get(`/api/admin/orders/${placed.id}`)
  check('staff notes visible in the admin', adminView.data.order?.adminNotes === 'Internal: smoke test note', adminView.data.order?.adminNotes)

  console.log('\nSecurity: business rules')
  const v2Id = placed.items[1]?.variantId
  const bigLine = await anon.post('/api/orders', { lines: [{ variantId: v2Id, quantity: 11 }], shippingMethod: 'standard', email: `big-${stamp}@example.com`, address, paymentMethod: 'cod' })
  check('more than 10 of one piece → 422', bigLine.status === 422, bigLine.status)
  const pool = (await anon.get('/api/products')).data.products.flatMap((p) => p.variants).slice(0, 4)
  const tooMany = await anon.post('/api/orders', { lines: pool.map((v) => ({ variantId: v.id, quantity: 8 })), shippingMethod: 'standard', email: `many-${stamp}@example.com`, address, paymentMethod: 'cod' })
  check('more than 30 pieces in one order → 422', tooMany.status === 422, tooMany.status)
  const line = placed.items[1]
  const triple = await shopper.post('/api/returns', { orderId: placed.id, items: [1, 2, 3].map(() => ({ orderItemId: line.id, quantity: 1 })), reason: 'other' })
  check('repeated return lines are added up (3 of 2 bought → refused)', triple.status === 400, triple.status)
  const twice = await shopper.post('/api/returns', { orderId: placed.id, items: [{ orderItemId: line.id, quantity: 1 }, { orderItemId: line.id, quantity: 1 }], reason: 'other' })
  const expectedRefund = Math.round(line.price * 2 * (1 - placed.discount / placed.subtotal) * 100) / 100
  check('refund is net of the order discount', twice.status === 201 && twice.data.return.items[0].quantity === 2 && Math.abs(twice.data.return.refundAmount - expectedRefund) < 0.01, { status: twice.status, refund: twice.data.return?.refundAmount, expectedRefund })
  const one = await shopper.post('/api/orders', { lines: [{ variantId: v2Id, quantity: 1 }], shippingMethod: 'standard', email: shopperEmail, address, paymentMethod: 'cod' })
  await admin.patch(`/api/admin/orders/${one.data.order.id}`, { status: 'delivered' })
  const req = { orderId: one.data.order.id, items: [{ orderItemId: one.data.order.items[0].id, quantity: 1 }], reason: 'other' }
  const race = await Promise.all([shopper.post('/api/returns', req), shopper.post('/api/returns', req), shopper.post('/api/returns', req)])
  check('simultaneous returns for the last unit: exactly one succeeds', race.filter((r) => r.status === 201).length === 1, race.map((r) => r.status))
  const publicReviews = (await anon.get(`/api/products/${cardigan.handle}/reviews`)).data.reviews
  check('public reviews carry no account ids', publicReviews.length > 0 && publicReviews.every((r) => !('userId' in r)), publicReviews[0])
  const named = await anon.post('/api/orders/lookup', { orderNumber: guest.orderNumber, email: guest.email })
  check('guest tracking shortens the surname', named.data.order?.customerName === 'Ada L.', named.data.order?.customerName)

  console.log('\nSecurity: stored content')
  // A deliberately malicious value: the server must refuse it.
  // eslint-disable-next-line no-script-url
  const js = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, primaryCtaHref: 'javascript:alert(1)' } })
  check('script (javascript-scheme) link refused → 422', js.status === 422, js.status)
  const panels = settings.homepage.heroPanels ?? []
  check('home hero has the Women / Men / Kids panels by default', ['Women', 'Men', 'Kids'].every((l) => panels.some((p) => p.label === l)), panels)
  // eslint-disable-next-line no-script-url
  const panelJs = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, heroPanels: [{ label: 'X', href: 'javascript:alert(1)', image: '' }] } })
  check('script link in a hero panel refused → 422', panelJs.status === 422, panelJs.status)
  const fourPanels = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, heroPanels: [...panels, ...panels].slice(0, 4) } })
  check('more than three hero panels refused → 422', fourPanels.status === 422, fourPanels.status)
  const homeHtml = new TextDecoder().decode((await anon.get('/')).data)
  // A hero panel is a link to the department holding its name and "Shop <name>" (the header links have neither).
  const panel = (href, label) => new RegExp(`href="${href}"[^>]*>(?:(?!</a>)[\\s\\S])*>${label}</span>(?:(?!</a>)[\\s\\S])*Shop (?:<!-- -->)?${label.toLowerCase()}`).test(homeHtml)
  check('home hero opens on the campaign photograph by default', homeHtml.includes('%2Fimages%2Fhero%2Fcampaign.webp'), null)
  check('…with the Women, Men and Kids photographs under it', ['Women', 'Men', 'Kids'].every((l) => panel(`/shop/${l.toLowerCase()}`, l)), null)
  check('home page shows New in by default', homeHtml.includes('id="new-in-title"'), null)
  const sections = settings.homepage.sections ?? {}
  const hideNewIn = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, sections: { ...sections, newIn: false } } })
  check('admin hides the New in section → 200', hideNewIn.status === 200 && hideNewIn.data.value?.sections?.newIn === false, hideNewIn.data)
  let gone = false
  for (let i = 0; i < 10 && !gone; i++) {
    gone = !new TextDecoder().decode((await anon.get('/')).data).includes('id="new-in-title"')
    if (!gone) await new Promise((r) => setTimeout(r, 500))
  }
  check('…and the home page no longer shows it', gone, null)
  check('home page shows the campaign band by default', homeHtml.includes('id="feature-title"'), null)
  const badFeature = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, feature: { ...settings.homepage.feature, image: 'https://evil.example/x.png' } } })
  check('campaign band image from an unknown host refused → 422', badFeature.status === 422, badFeature.status)
  const badHero = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, heroImage: '//evil.example/x.png' } })
  check('campaign hero image from an unknown host refused → 422', badHero.status === 422, badHero.status)
  const missingBand = await admin.put('/api/admin/settings', { section: 'homepage', value: { ...settings.homepage, sections, feature: { ...settings.homepage.feature, collectionHandle: `no-such-${stamp}` } } })
  check('campaign band pointed at a missing collection is saved → 200', missingBand.status === 200, missingBand.status)
  let bandGone = false
  for (let i = 0; i < 10 && !bandGone; i++) {
    bandGone = !new TextDecoder().decode((await anon.get('/')).data).includes('id="feature-title"')
    if (!bandGone) await new Promise((r) => setTimeout(r, 500))
  }
  check('…and the home page leaves the band out', bandGone, null)
  const restoreSections = await admin.put('/api/admin/settings', { section: 'homepage', value: settings.homepage })
  check('restore the home page sections', restoreSections.status === 200, restoreSections.status)
  // The video wall: an Instagram reel link alone is enough, and each clip belongs to a department.
  const reel = { id: `ig${stamp}`, url: 'https://www.instagram.com/reel/Deg44SrKwYz/?igsh=abc', poster: '', caption: 'Smoke reel', credit: '@smoke', department: 'men', productIds: [] }
  const badDept = await admin.put('/api/admin/settings', { section: 'videos', value: { ...settings.videos, enabled: true, items: [{ ...reel, department: 'pets' }] } })
  check('video with an unknown department refused → 422', badDept.status === 422, badDept.status)
  const igOnly = await admin.put('/api/admin/settings', { section: 'videos', value: { ...settings.videos, enabled: true, items: [reel] } })
  check('Instagram reel saved without a poster → 200', igOnly.status === 200 && igOnly.data.value?.items?.[0]?.department === 'men', igOnly.data)
  const wallOn = async (path) => {
    for (let i = 0; i < 10; i++) {
      const html = new TextDecoder().decode((await anon.get(path)).data)
      if (html.includes('id="video-wall-title"')) return html
      await new Promise((r) => setTimeout(r, 500))
    }
    return ''
  }
  const homeWall = await wallOn('/')
  check('home page shows the video wall with the reel', homeWall.includes('Smoke reel'), null)
  check('…through Instagram\'s own embed', homeWall.includes('www.instagram.com/p/Deg44SrKwYz/embed/'), null)
  check('Men page shows the men\'s reel', (await wallOn('/shop/men')).includes('Smoke reel'), null)
  const womenHtml = new TextDecoder().decode((await anon.get('/shop/women')).data)
  check('…and the Women page does not', !womenHtml.includes('id="video-wall-title"'), null)
  const igCsp = (await anon.get('/')).headers.get('content-security-policy') || ''
  check('pages may frame Instagram embeds (frame-src)', /frame-src[^;]*https:\/\/www\.instagram\.com/.test(igCsp), igCsp)
  const restoreVideos = await admin.put('/api/admin/settings', { section: 'videos', value: settings.videos })
  check('restore the video wall', restoreVideos.status === 200, restoreVideos.status)
  const proto = await admin.put('/api/admin/settings', { section: 'announcement', value: { ...settings.announcement, link: '//evil.example/x' } })
  check('protocol-relative link refused → 422', proto.status === 422, proto.status)
  const social = await admin.put('/api/admin/settings', { section: 'store', value: { ...settings.store, social: { ...settings.store.social, instagram: 'http://insecure.example' } } })
  check('non-https social link refused → 422', social.status === 422, social.status)
  const market = await admin.put('/api/admin/settings', { section: 'store', value: { ...settings.store, marketplaces: [{ name: 'Myntra', url: 'http://myntra.example' }] } })
  check('marketplace link that is not https refused → 422', market.status === 422, market.status)
  const marketOk = await admin.put('/api/admin/settings', { section: 'store', value: { ...settings.store, marketplaces: [{ name: 'Myntra', url: 'https://www.myntra.com/snugandknot' }] } })
  check('marketplace saved → 200', marketOk.status === 200 && marketOk.data.value?.marketplaces?.[0]?.name === 'Myntra', marketOk.data)
  let footerMarket = false
  for (let i = 0; i < 10 && !footerMarket; i++) {
    footerMarket = new TextDecoder().decode((await anon.get('/')).data).includes('Also shop us on')
    if (!footerMarket) await new Promise((r) => setTimeout(r, 500))
  }
  check('…and the footer shows the Also shop us on row', footerMarket, null)
  await admin.put('/api/admin/settings', { section: 'store', value: settings.store })
  const badWa = await admin.put('/api/admin/settings', { section: 'store', value: { ...settings.store, whatsapp: '12345' } })
  check('WhatsApp number without a country code refused → 422', badWa.status === 422, badWa.status)
  const homeWa = new TextDecoder().decode((await anon.get('/')).data)
  check('home page has the WhatsApp button for the store number', /wa\.me\/\d{8,15}/.test(homeWa), null)
  // The private client showcase: the secret never reaches the storefront, and the samples come only through it.
  const scToken = `smoke${stamp}`.padEnd(32, 'q')
  const scOn = await admin.put('/api/admin/settings', { section: 'showcase', value: { enabled: true, token: scToken } })
  check('client showcase switched on → 200', scOn.status === 200 && scOn.data.value?.token === scToken, scOn.data)
  const scHome = new TextDecoder().decode((await anon.get('/')).data)
  check('…its secret is not in the public home page', !scHome.includes(scToken), null)
  const scGet = await anon.get(`/api/showcase?token=${scToken}`)
  check('…sample reviews through the link', scGet.status === 200 && scGet.data.reviews?.length >= 3, scGet.status)
  check('…and no sample review counts as a real one', (await anon.get('/api/products')).data.products.every((p) => !String(JSON.stringify(p)).includes('Softer than I expected')), null)
  await admin.put('/api/admin/settings', { section: 'showcase', value: { enabled: false, token: '' } })
  check('showcase off → link answers 404', (await anon.get(`/api/showcase?token=${scToken}`)).status === 404, null)
  const badRefund = await admin.put('/api/admin/settings', { section: 'commerce', value: { ...settings.commerce, refundDays: 0 } })
  check('refund days below 1 refused → 422', badRefund.status === 422, badRefund.status)
  const shipHtml = new TextDecoder().decode((await anon.get('/shipping-returns')).data)
  check('shipping page states the delivery time and the refund terms', shipHtml.includes('3–7 working days') && shipHtml.includes('working days') && shipHtml.includes('Who pays for return shipping?'), null)
  const cols = (await admin.get('/api/admin/collections')).data.collections
  for (const bad of ['//evil.example/x.png', 'https://evil.example/x.png', '/\\evil.example/x.png']) {
    const r = await admin.put(`/api/admin/collections/${cols[0].id}`, { ...cols[0], image: bad })
    check(`image URL ${JSON.stringify(bad)} refused → 422`, r.status === 422, r.status)
  }
  const spoof = new FormData()
  spoof.append('file', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'evil.png')
  check('upload whose bytes are not an image → 415', (await admin.post('/api/admin/media', spoof)).status === 415)
  await anon.post('/api/contact', { name: 'Sm\u202Eoke\u0007', email: `ctl-${stamp}@example.com`, message: 'Testing invisible \u202Ecpackage.exe characters.' })
  const stored = (await admin.get('/api/admin/messages')).data.messages.find((x) => x.email === `ctl-${stamp}@example.com`)
  check('invisible control characters stripped from stored text', stored && stored.name === 'Smoke' && !/[\u202E\u0007]/.test(stored.body), stored && { name: stored.name })
  if (stored) await admin.del(`/api/admin/messages/${stored.id}`)
  const badDate = await admin.post('/api/admin/coupons', { code: `BAD${stamp}`.toUpperCase().slice(0, 20), type: 'fixed', value: 5, expiresAt: '2026-02-31' })
  check('impossible date refused → 422', badDate.status === 422, badDate.status)

  console.log('\nSecurity: hardening')
  // Cash on delivery: one email cannot hold more than 12 pieces in unconfirmed orders.
  const holder = new Client('holder', `10.252.${Math.floor(Math.random() * 250)}.3`)
  const holdEmail = `hold-${stamp}@example.com`
  const stockVariant = (await anon.get('/api/products')).data.products.flatMap((p) => p.variants).find((v) => v.inventory >= 9)
  const hold1 = await holder.post('/api/orders', { lines: [{ variantId: stockVariant.id, quantity: 8 }], shippingMethod: 'standard', email: holdEmail, address, paymentMethod: 'cod' })
  const hold2 = await holder.post('/api/orders', { lines: [{ variantId: stockVariant.id, quantity: 5 }], shippingMethod: 'standard', email: holdEmail.toUpperCase(), address, paymentMethod: 'cod' })
  check('a 2nd COD order past 12 held pieces for one email → 429', hold1.status === 201 && hold2.status === 429 && /waiting to be confirmed/.test(hold2.data.error), { first: hold1.status, second: hold2.status, msg: hold2.data.error })
  if (hold1.data.order) await admin.patch(`/api/admin/orders/${hold1.data.order.id}`, { status: 'confirmed' })
  const hold3 = await holder.post('/api/orders', { lines: [{ variantId: stockVariant.id, quantity: 1 }], shippingMethod: 'standard', email: holdEmail, address, paymentMethod: 'cod' })
  check('…confirmed orders no longer count towards it', hold3.status === 201, hold3.status)
  for (const o of [hold1.data.order, hold3.data.order]) if (o) await admin.patch(`/api/admin/orders/${o.id}`, { status: 'cancelled' })

  // Sign-in: only failures count, and a correct password clears that connection's failures.
  const loginEmail = `login-${stamp}@example.com`
  const loginUser = new Client('login-user', `10.253.${Math.floor(Math.random() * 250)}.4`)
  await loginUser.post('/api/auth/signup', { name: 'Login Test', email: loginEmail, password: 'login-knit-77' })
  for (let i = 0; i < 9; i++) await loginUser.post('/api/auth/login', { email: loginEmail, password: `nope-${i}-xyz` })
  const okAfterNine = await loginUser.post('/api/auth/login', { email: loginEmail, password: 'login-knit-77' })
  let allOk = okAfterNine.status === 200
  for (let i = 0; i < 12; i++) allOk = (await loginUser.post('/api/auth/login', { email: loginEmail, password: 'login-knit-77' })).status === 200 && allOk
  check('correct sign-ins never use up the limit (9 failures, then 13 successes)', allOk, okAfterNine.status)
  for (let i = 0; i < 9; i++) await loginUser.post('/api/auth/login', { email: loginEmail, password: `again-${i}-xyz` })
  check('…because a success cleared the earlier failures', (await loginUser.post('/api/auth/login', { email: loginEmail, password: 'login-knit-77' })).status === 200)

  // IPv6: addresses in one /64 share a limit (contact: 5 per 10 minutes).
  const net = `2001:db8:${Math.floor(Math.random() * 65535).toString(16)}:${Math.floor(Math.random() * 65535).toString(16)}`
  let last6
  for (let i = 1; i <= 6; i++) last6 = await new Client(`v6-${i}`, `${net}::${i.toString(16)}`).post('/api/contact', { name: 'Six', email: `six-${stamp}-${i}@example.com`, message: 'Rotating through one IPv6 network.' })
  check('6th contact message from one IPv6 /64 (different addresses) → 429', last6.status === 429, last6.status)
  const otherNet = await new Client('v6-other', `2001:db8:ffff:${Math.floor(Math.random() * 65535).toString(16)}::1`).post('/api/contact', { name: 'Other', email: `other-${stamp}@example.com`, message: 'A different IPv6 network entirely.' })
  check('…another /64 is not affected', otherNet.status === 201 || otherNet.status === 200, otherNet.status)

  // Subscriber export: cells that a spreadsheet would run as a formula are neutralised.
  const formula = `+cmd-${stamp}@example.com`
  await anon.post('/api/newsletter', { email: formula, source: 'footer' })
  const csv = await admin.req('GET', '/api/admin/subscribers?format=csv')
  const csvText = Buffer.from(csv.data).toString()
  check("CSV export quotes cells and prefixes formula characters with '", csvText.includes(`"'${formula}"`) && !csvText.split('\n').some((l) => l.startsWith('+')), csvText.split('\n').find((l) => l.includes(stamp)))
  await admin.del(`/api/admin/subscribers?email=${encodeURIComponent(formula)}`)

  console.log('\nSecurity: admin sign-out')
  const second = new Client('admin-laptop')
  await second.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  check('admin signed in on a second device', (await admin.get('/api/admin/stats')).status === 200 && (await second.get('/api/admin/stats')).status === 200)
  await second.post('/api/auth/logout')
  const afterOut = await admin.get('/api/auth/me')
  check('admin sign-out ends the other admin sessions too', afterOut.data.user === null, afterOut.data)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
