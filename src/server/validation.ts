import 'server-only'
import { z } from 'zod'

const trimmed = (max: number) => z.string().trim().max(max)
const required = (max: number, label = 'This field') => z.string().trim().min(1, `${label} is required`).max(max)
export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(254)
const money = z.coerce.number().finite().min(0).max(1_000_000).transform((n) => Math.round(n * 100) / 100)
const handle = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Handle must be at least 2 characters')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')
/** Local paths ("/images/…", "/api/media/…") or absolute https URLs. */
const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === '' || v.startsWith('/') || /^https:\/\//.test(v), 'Use a /path or an https:// URL')

export const signupSchema = z.object({
  name: required(80, 'Name'),
  email: emailSchema,
  password: z.string().min(8, 'Use at least 8 characters').max(200),
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
  newPassword: z.string().min(8, 'Use at least 8 characters').max(200),
})

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: required(120, 'Title'),
  body: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(4000),
  fit: z.enum(['small', 'true', 'large']).nullable().optional(),
})

const lineSchema = z.object({
  variantId: required(120),
  quantity: z.coerce.number().int().min(1).max(20),
})

export const quoteSchema = z.object({
  lines: z.array(lineSchema).max(50),
  couponCode: trimmed(40).nullable().optional(),
  shippingMethod: z.enum(['standard', 'express']).optional(),
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
  lines: z.array(lineSchema).min(1, 'Your bag is empty').max(50),
  couponCode: trimmed(40).nullable().optional(),
  shippingMethod: z.enum(['standard', 'express']),
  email: emailSchema,
  address: addressSchema,
  notes: trimmed(500).nullable().optional(),
  paymentMethod: z.literal('cod'),
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
  source: trimmed(40).optional(),
})

export const contactSchema = z.object({
  name: required(80, 'Name'),
  email: emailSchema,
  subject: trimmed(160).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
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
      .nullable()
      .default(null),
    active: z.boolean().default(true),
    usageLimit: z.coerce.number().int().positive().nullable().default(null),
  })
  .refine((c) => c.type !== 'percentage' || c.value <= 100, { path: ['value'], message: 'A percentage cannot exceed 100' })

export const orderPatchSchema = z.object({
  status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
  trackingNumber: trimmed(80).nullable().optional(),
  notes: trimmed(1000).nullable().optional(),
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
      instagram: trimmed(300),
      pinterest: trimmed(300),
      tiktok: trimmed(300),
      twitter: trimmed(300),
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
  }),
  announcement: z.object({
    enabled: z.boolean(),
    messages: z.array(trimmed(160)).max(8),
    link: trimmed(300),
  }),
  reviews: z.object({ moderation: z.enum(['manual', 'auto']) }),
  homepage: z.object({
    heroEyebrow: trimmed(80),
    heroTitle: required(160, 'Hero title'),
    heroSubtitle: trimmed(400),
    primaryCtaLabel: trimmed(40),
    primaryCtaHref: trimmed(300),
    secondaryCtaLabel: trimmed(40),
    secondaryCtaHref: trimmed(300),
    manifesto: trimmed(600),
  }),
  seo: z.object({
    title: required(160, 'SEO title'),
    description: trimmed(320),
    ogImage: imageUrl,
  }),
} as const
