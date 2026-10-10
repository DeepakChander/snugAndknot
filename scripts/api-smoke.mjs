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

class Client {
  constructor(name) {
    this.name = name
    this.cookie = ''
  }
  async req(method, path, body, extraHeaders = {}) {
    const headers = { Origin: BASE, ...extraHeaders }
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
      if (pair.startsWith('sk_session=')) this.cookie = pair.endsWith('=') ? '' : pair
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
  const forged = await new Client('forged').req('GET', '/api/auth/me', undefined, { Cookie: 'sk_session=eyJzdWIiOiJ4Iiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.AAAA' })
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
  check('purchase makes the review "verified"', review.data.review?.verified === true, review.data.review)
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
  check('cancellation removes points earned', pointsAfter === pointsBefore - tamperOrder.pointsEarned, { pointsBefore, pointsAfter })
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
  const catDel = await admin.del('/api/admin/categories/cardigans')
  check('category in use cannot be deleted → 409', catDel.status === 409, catDel.data)
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
  const logout = await shopper.post('/api/auth/logout')
  check('logout clears the session', logout.status === 200 && !shopper.cookie)

  console.log(`\n${passes} passed, ${failures} failed\n`)
  process.exit(failures ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
