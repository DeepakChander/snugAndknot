import 'server-only'
import { z } from 'zod'
import { MAX_WALL_PRODUCTS, MAX_WALL_VIDEOS, detectVideo } from '@/lib/video'

/**
 * Removes characters that are invisible but dangerous in stored text: control characters
 * (other than tab and line breaks) and the Unicode direction overrides used to disguise text
 * ("gnp.exe" shown as "exe.png"). Also normalises to NFC so look-alike sequences compare equal.
 * HTML needs no stripping here: React escapes every value it renders.
 */
const UNSAFE_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g
export const cleanText = (v: string) => v.normalize('NFC').replace(UNSAFE_CHARS, '')
const text = () => z.string().overwrite(cleanText)
const trimmed = (max: number) => text().trim().max(max)
const required = (max: number, label = 'This field') => text().trim().min(1, `${label} is required`).max(max)
export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(254)
const money = z.coerce.number().finite().min(0).max(1_000_000).transform((n) => Math.round(n * 100) / 100)
const currencyCode = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code')

/** Prices in the additional currencies: { INR: { price, compareAtPrice } }. */
const priceBookSchema = z
  .record(currencyCode, z.object({ price: money, compareAtPrice: money.nullable().default(null) }))
  .refine((b) => Object.keys(b).length <= 10, 'At most 10 currencies')
  .default({})

const handle = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Handle must be at least 2 characters')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')
/** A path on this site: "/x", but not "//host" or "/\\host" (browsers treat both as another site). */
const isLocalPath = (v: string) => /^\/(?![\/\\])[^\s\\]*$/.test(v)
/** Photo hosts the image optimiser is configured for (next.config.ts → images.remotePatterns). */
const IMAGE_HOSTS = ['images.unsplash.com', 'images.pexels.com']
const isAllowedImageUrl = (v: string) => {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && IMAGE_HOSTS.includes(u.hostname) && !u.username && !u.password
  } catch {
    return false
  }
}
/** Uploaded or bundled images ("/images/…", "/api/media/…") or https photos from the allowed hosts. */
const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === '' || isLocalPath(v) || isAllowedImageUrl(v), 'Upload the image, or use a /path or an https://images.unsplash.com or images.pexels.com URL')
const isHttps = (v: string) => {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && !u.username && !u.password
  } catch {
    return false
  }
}
/** Where a button or banner may send people: a page on this site or an https:// address. Never javascript:, data: or the like. */
const linkUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || isLocalPath(v) || isHttps(v), 'Use a /path on this site or an https:// address')
const httpsUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || isHttps(v), 'Use a full https:// address')

/** The most common passwords that still meet the length rule. */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'passw0rd', 'p@ssw0rd', 'p@ssword',
  '12345678', '123456789', '1234567890', '0123456789', '87654321', '11111111', '00000000', '12341234',
  'qwertyui', 'qwertyuiop', 'qwerty123', 'qwerty12', '1q2w3e4r', '1q2w3e4r5t', 'zaq12wsx', 'asdfghjkl',
  'iloveyou', 'iloveyou1', 'sunshine', 'princess', 'football', 'baseball', 'welcome1', 'welcome123',
  'letmein1', 'abc12345', 'abcd1234', 'admin123', 'administrator', 'trustno1', 'superman', 'starwars',
  'whatever', 'computer', 'michelle', 'jennifer', 'sweetheart', 'snugandknot', 'snugknot',
])
const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(200, 'Use at most 200 characters')
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), 'That password is too common. Choose something harder to guess.')
  .refine((v) => new Set(v).size >= 4, 'Use a less repetitive password')

export const signupSchema = z
  .object({
    name: required(80, 'Name'),
    email: emailSchema,
    password: newPassword,
  })
  .refine((v) => v.password.toLowerCase() !== v.email && v.password.toLowerCase() !== v.email.split('@')[0], {
    path: ['password'],
    message: 'Your password cannot be your email address',
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(200),
})

export const profileSchema = z.object({
  name: required(80, 'Name'),
  phone: trimmed(40).nullable().optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: newPassword,
})

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: required(120, 'Title'),
  body: text().trim().min(10, 'Tell us a little more (10+ characters)').max(4000),
  fit: z.enum(['small', 'true', 'large']).nullable().optional(),
})

/** Per-order caps: unpaid cash-on-delivery orders hold stock, so one order cannot empty the shelves. */
export const MAX_LINE_QTY = 10
export const MAX_ORDER_PIECES = 30
const lineSchema = z.object({
  variantId: required(120),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QTY, `At most ${MAX_LINE_QTY} of one piece per order`),
})

export const quoteSchema = z.object({
  lines: z.array(lineSchema).max(20),
  couponCode: trimmed(40).nullable().optional(),
  shippingMethod: z.enum(['standard', 'express']).optional(),
  /** The currency the shopper sees. Unknown or unset: the base currency. */
  currency: currencyCode.optional(),
})

export const addressSchema = z.object({
  firstName: required(60, 'First name'),
  lastName: required(60, 'Last name'),
  line1: required(160, 'Address'),
  line2: trimmed(160).optional(),
  city: required(80, 'City'),
  state: required(80, 'State / region'),
  postalCode: required(20, 'Postal code'),
  country: required(80, 'Country'),
  phone: trimmed(40).optional(),
})

export const orderSchema = z.object({
  lines: z
    .array(lineSchema)
    .min(1, 'Your bag is empty')
    .max(20, 'At most 20 different pieces per order')
    .refine((l) => l.reduce((n, x) => n + x.quantity, 0) <= MAX_ORDER_PIECES, `Orders are limited to ${MAX_ORDER_PIECES} pieces. Contact us for larger orders.`),
  couponCode: trimmed(40).nullable().optional(),
  shippingMethod: z.enum(['standard', 'express']),
  email: emailSchema,
  address: addressSchema,
  notes: trimmed(500).nullable().optional(),
  paymentMethod: z.enum(['cod', 'razorpay']),
  /** The currency the shopper saw. It must be one the shop sells in, or the order is refused. */
  currency: currencyCode.optional(),
})

/** What Razorpay Checkout hands the browser after a successful payment. */
export const paymentConfirmSchema = z.object({
  razorpayOrderId: z.string().trim().regex(/^order_[A-Za-z0-9]{6,40}$/, 'Invalid payment reference'),
  razorpayPaymentId: z.string().trim().regex(/^pay_[A-Za-z0-9]{6,40}$/, 'Invalid payment reference'),
  razorpaySignature: z.string().trim().regex(/^[a-f0-9]{64}$/, 'Invalid payment signature'),
})

export const paymentCancelSchema = z.object({
  razorpayOrderId: z.string().trim().regex(/^order_[A-Za-z0-9]{6,40}$/, 'Invalid payment reference'),
})

export const orderLookupSchema = z.object({
  orderNumber: required(40, 'Order number'),
  email: emailSchema,
})

export const returnSchema = z.object({
  orderId: required(80),
  items: z.array(z.object({ orderItemId: required(120), quantity: z.coerce.number().int().min(1).max(20) })).min(1),
  reason: z.enum(['wrong-size', 'defective', 'not-as-described', 'changed-mind', 'other']),
  comments: trimmed(1000).nullable().optional(),
})

export const newsletterSchema = z.object({
  email: emailSchema,
  source: trimmed(40).regex(/^[a-z0-9-]*$/i, 'Invalid source').optional(),
})

export const contactSchema = z.object({
  name: required(80, 'Name'),
  email: emailSchema,
  subject: trimmed(160).optional(),
  message: text().trim().min(10, 'Message must be at least 10 characters').max(5000),
})

export const stockAlertSchema = z.object({
  productId: required(120),
  variantId: trimmed(120).nullable().optional(),
  email: emailSchema,
})

/* ─────────────────────────── Admin ─────────────────────────── */

export const productSchema = z
  .object({
    handle,
    title: required(160, 'Title'),
    description: trimmed(8000),
    details: z
      .object({
        fabric: trimmed(300).optional(),
        fit: trimmed(300).optional(),
        care: trimmed(500).optional(),
        sustainability: trimmed(500).optional(),
        features: z.array(trimmed(200)).max(20).optional(),
      })
      .default({}),
    vendor: trimmed(80).default('Snug&Knot'),
    productType: trimmed(80).default(''),
    gender: z.enum(['men', 'women', 'kids', 'unisex']),
    category: trimmed(80).default(''),
    tags: z.array(trimmed(40)).max(40).default([]),
    price: money,
    compareAtPrice: money.nullable().default(null),
    prices: priceBookSchema,
    images: z
      .array(z.object({ src: imageUrl.refine((v) => v.length > 0, 'Image URL is required'), alt: trimmed(300).default(''), width: z.number().int().positive().optional(), height: z.number().int().positive().optional() }))
      .max(20)
      .default([]),
    colors: z
      .array(z.object({ name: required(60, 'Colour name'), hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a #RRGGBB colour') }))
      .max(20)
      .default([]),
    featured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    bestseller: z.boolean().default(false),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
    seoTitle: trimmed(160).nullable().default(null),
    seoDescription: trimmed(320).nullable().default(null),
    variants: z
      .array(
        z.object({
          id: trimmed(120).optional(),
          title: trimmed(120).optional(),
          sku: required(80, 'SKU'),
          size: trimmed(40).nullable().default(null),
          color: trimmed(60).nullable().default(null),
          price: money,
          compareAtPrice: money.nullable().default(null),
          inventory: z.coerce.number().int().min(0).max(1_000_000),
          prices: priceBookSchema,
        })
      )
      .min(1, 'Add at least one variant')
      .max(100),
  })
  .superRefine((p, ctx) => {
    if (p.compareAtPrice !== null && p.compareAtPrice > 0 && p.compareAtPrice <= p.price) {
      ctx.addIssue({ code: 'custom', path: ['compareAtPrice'], message: 'Compare-at price must be higher than the price' })
    }
    const skus = new Set<string>()
    p.variants.forEach((v, i) => {
      const key = v.sku.toUpperCase()
      if (skus.has(key)) ctx.addIssue({ code: 'custom', path: ['variants', i, 'sku'], message: 'Duplicate SKU' })
      skus.add(key)
    })
  })

export const collectionSchema = z.object({
  handle,
  title: required(120, 'Title'),
  subtitle: trimmed(160).default(''),
  description: trimmed(2000).default(''),
  image: imageUrl.default(''),
  productIds: z.array(required(120)).max(200).default([]),
  featured: z.boolean().default(false),
  position: z.coerce.number().int().min(0).max(10_000).default(0),
})

export const categorySchema = z.object({
  slug: handle,
  title: required(80, 'Title'),
  description: trimmed(1000).default(''),
  image: imageUrl.default(''),
  position: z.coerce.number().int().min(0).max(10_000).default(0),
  badge: trimmed(24).default(''),
  showOnHome: z.boolean().default(true),
})

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'Code must be at least 3 characters')
      .max(40)
      .regex(/^[A-Z0-9_-]+$/, 'Use letters, numbers, _ or -'),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive('Value must be greater than 0').max(1_000_000),
    minPurchase: money.default(0),
    description: trimmed(200).default(''),
    expiresAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`)
        return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v)
      }, 'That date does not exist')
      .nullable()
      .default(null),
    active: z.boolean().default(true),
    usageLimit: z.coerce.number().int().positive().nullable().default(null),
    /** Per additional currency: the fixed amount off (fixed codes only) and the minimum spend. */
    amounts: z
      .record(currencyCode, z.object({ value: money.nullable().default(null), minPurchase: money.default(0) }))
      .default({}),
  })
  .refine((c) => c.type !== 'percentage' || c.value <= 100, { path: ['value'], message: 'A percentage cannot exceed 100' })

export const orderPatchSchema = z.object({
  status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
  trackingNumber: trimmed(80).nullable().optional(),
  adminNotes: trimmed(2000).nullable().optional(),
})

export const reviewPatchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  adminReply: trimmed(2000).nullable().optional(),
})

export const customerPatchSchema = z.object({
  role: z.enum(['customer', 'admin']).optional(),
  points: z.coerce.number().int().min(0).max(10_000_000).optional(),
})

export const messagePatchSchema = z.object({ status: z.enum(['new', 'read', 'archived']) })
export const returnPatchSchema = z.object({ status: z.enum(['pending', 'approved', 'rejected', 'received', 'refunded']) })

const VIDEO_URL_HELP = 'Use an https:// link to an .mp4, .webm or .mov file, a YouTube video or Short, or an Instagram post or reel'
const wallItem = z
  .object({
    id: z.string().trim().regex(/^[A-Za-z0-9_-]{1,40}$/, 'Invalid id'),
    url: z.string().trim().min(1, 'Paste a video link').max(500).refine((v) => detectVideo(v) !== null, VIDEO_URL_HELP),
    poster: imageUrl.default(''),
    caption: trimmed(200).default(''),
    credit: trimmed(60).default(''),
    productIds: z
      .array(required(120))
      .max(MAX_WALL_PRODUCTS, `Tag at most ${MAX_WALL_PRODUCTS} pieces in one video`)
      .default([])
      .transform((ids) => [...new Set(ids)]),
  })
  .superRefine((v, ctx) => {
    // Instagram cannot be played inline, so the poster is all that shows.
    if (detectVideo(v.url)?.kind === 'instagram' && !v.poster) ctx.addIssue({ code: 'custom', path: ['poster'], message: 'Instagram posts need a poster image' })
  })
export const videoWallSchema = z
  .object({
    enabled: z.boolean(),
    heading: trimmed(60),
    intro: trimmed(300),
    ctaLabel: trimmed(40),
    ctaHref: httpsUrl,
    items: z.array(wallItem).max(MAX_WALL_VIDEOS, `At most ${MAX_WALL_VIDEOS} videos`),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>()
    v.items.forEach((it, i) => {
      if (seen.has(it.id)) ctx.addIssue({ code: 'custom', path: ['items', i, 'id'], message: 'Duplicate video id' })
      seen.add(it.id)
    })
  })

const nonNegative = z.coerce.number().finite().min(0).max(1_000_000)
export const settingsSchemas = {
  store: z.object({
    name: required(80, 'Store name'),
    tagline: trimmed(200),
    description: trimmed(500),
    email: emailSchema,
    phone: trimmed(40),
    address: z.object({
      street: trimmed(160),
      city: trimmed(80),
      state: trimmed(80),
      zip: trimmed(20),
      country: trimmed(80),
    }),
    social: z.object({
      instagram: httpsUrl,
      pinterest: httpsUrl,
      tiktok: httpsUrl,
      twitter: httpsUrl,
    }),
  }),
  commerce: z.object({
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code'),
    locale: trimmed(20).refine((l) => {
      try {
        return Intl.NumberFormat.supportedLocalesOf([l]).length > 0
      } catch {
        return false
      }
    }, 'Unknown locale'),
    freeShippingThreshold: nonNegative,
    standardShippingRate: nonNegative,
    expressShippingRate: nonNegative,
    taxRate: z.coerce.number().finite().min(0).max(50),
    returnWindowDays: z.coerce.number().int().min(0).max(365),
    pointsPerDollar: z.coerce.number().finite().min(0).max(100),
    codEnabled: z.boolean(),
    onlinePaymentsEnabled: z.boolean().default(false),
    extraCurrencies: z
      .array(
        z.object({
          code: currencyCode,
          locale: trimmed(20).refine((l) => {
            try {
              return Intl.NumberFormat.supportedLocalesOf([l]).length > 0
            } catch {
              return false
            }
          }, 'Unknown locale'),
          freeShippingThreshold: nonNegative,
          standardShippingRate: nonNegative,
          expressShippingRate: nonNegative,
          pointsPerUnit: z.coerce.number().finite().min(0).max(100),
          countries: z
            .array(z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, 'Use 2-letter country codes, e.g. IN'))
            .max(50)
            .default([]),
        })
      )
      .max(3, 'At most 3 additional currencies')
      .default([]),
  })
  .superRefine((c, ctx) => {
    const seen = new Set([c.currency])
    c.extraCurrencies.forEach((x, i) => {
      if (seen.has(x.code)) ctx.addIssue({ code: 'custom', path: ['extraCurrencies', i, 'code'], message: `${x.code} is already one of the store's currencies` })
      seen.add(x.code)
      try {
        new Intl.NumberFormat('en', { style: 'currency', currency: x.code })
      } catch {
        ctx.addIssue({ code: 'custom', path: ['extraCurrencies', i, 'code'], message: 'Unknown currency code' })
      }
    })
  }),
  announcement: z.object({
    enabled: z.boolean(),
    messages: z.array(trimmed(160)).max(8).transform((m) => m.filter(Boolean)),
    link: linkUrl,
  }),
  reviews: z.object({ moderation: z.enum(['manual', 'auto']) }),
  homepage: z.object({
    heroEyebrow: trimmed(80),
    heroTitle: required(160, 'Hero title'),
    heroSubtitle: trimmed(400),
    primaryCtaLabel: trimmed(40),
    primaryCtaHref: linkUrl,
    secondaryCtaLabel: trimmed(40),
    secondaryCtaHref: linkUrl,
    manifesto: trimmed(600),
    heroImage: imageUrl,
    heroImageAlt: trimmed(160),
    departmentImages: z.object({ men: imageUrl, women: imageUrl, kids: imageUrl }),
    features: z
      .array(z.object({ icon: z.enum(['fabric', 'factory', 'leaf', 'truck', 'returns', 'needle']), title: required(40, 'Title'), body: trimmed(80) }))
      .max(4, 'At most 4 promises'),
    storyEyebrow: trimmed(40),
    storyTitle: trimmed(120),
    storyBody: trimmed(800),
    storySignature: trimmed(80),
    storyCtaLabel: trimmed(40),
    storyCtaHref: linkUrl,
    storyImage: imageUrl,
    storyImageAlt: trimmed(160),
    bannerEyebrow: trimmed(40),
    bannerTitle: trimmed(80),
    bannerBody: trimmed(200),
    bannerCtaLabel: trimmed(40),
    bannerCtaHref: linkUrl,
    bannerImage: imageUrl,
    bannerImageAlt: trimmed(160),
  }),
  seo: z.object({
    title: required(160, 'SEO title'),
    description: trimmed(320),
    ogImage: imageUrl,
  }),
  videos: videoWallSchema,
} as const
