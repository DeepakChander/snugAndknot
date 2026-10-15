/**
 * Domain types shared by the server (repositories, API routes) and the UI.
 * Everything here is JSON-serialisable: dates are ISO strings, money is a number in
 * the store currency.
 */

export type Gender = 'men' | 'women' | 'kids' | 'unisex'
export type ProductStatus = 'active' | 'draft' | 'archived'

export interface ProductImage {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface ColorSwatch {
  name: string
  hex: string
}

export interface ProductDetails {
  fabric?: string
  fit?: string
  care?: string
  sustainability?: string
  features?: string[]
}

export interface Variant {
  id: string
  title: string
  sku: string
  size: string | null
  color: string | null
  price: number
  compareAtPrice: number | null
  inventory: number
  available: boolean
  position: number
}

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  details: ProductDetails
  vendor: string
  productType: string
  gender: Gender
  category: string
  tags: string[]
  price: number
  compareAtPrice: number | null
  images: ProductImage[]
  colors: ColorSwatch[]
  sizes: string[]
  featured: boolean
  isNew: boolean
  bestseller: boolean
  status: ProductStatus
  seoTitle: string | null
  seoDescription: string | null
  variants: Variant[]
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  slug: string
  title: string
  description: string
  image: string
  position: number
}

export interface Collection {
  id: string
  handle: string
  title: string
  subtitle: string
  description: string
  image: string
  productIds: string[]
  featured: boolean
  position: number
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type ReviewFit = 'small' | 'true' | 'large'

export interface Review {
  id: string
  productId: string
  /** Set only on reviews loaded for the admin panel; public reviews never carry account ids. */
  userId?: string | null
  author: string
  rating: number
  title: string
  body: string
  fit: ReviewFit | null
  verified: boolean
  status: ReviewStatus
  helpful: number
  adminReply: string | null
  createdAt: string
}

export interface RatingSummary {
  average: number
  count: number
  /** Index 0 = one-star count … index 4 = five-star count. */
  distribution: [number, number, number, number, number]
  fit: { small: number; true: number; large: number }
}

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  description: string
  expiresAt: string | null
  active: boolean
  usageLimit: number | null
  usedCount: number
}

/** 'pending_payment': paid online, stock held, waiting for the payment to be confirmed. Customers never see it. */
export type OrderStatus = 'pending_payment' | 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cod' | 'razorpay'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type ShippingMethod = 'standard' | 'express'

export interface Address {
  firstName: string
  lastName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface OrderItem {
  id: string
  productId: string | null
  variantId: string | null
  handle: string
  title: string
  image: string
  size: string | null
  color: string | null
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  email: string
  customerName: string
  status: OrderStatus
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingMethod: ShippingMethod
  subtotal: number
  shipping: number
  discount: number
  tax: number
  total: number
  couponCode: string | null
  shippingAddress: Address
  trackingNumber: string | null
  /** The customer's own note from checkout. */
  notes: string | null
  /** Staff-only notes. Present only on orders loaded for the admin panel. */
  adminNotes?: string | null
  pointsEarned: number
  placedAt: string
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  /** When an online payment was confirmed. Null for cash on delivery and for unpaid online orders. */
  paidAt: string | null
  /** Razorpay's payment id (pay_…), once paid online. */
  paymentReference: string | null
  items: OrderItem[]
}

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'refunded'
export type ReturnReason = 'wrong-size' | 'defective' | 'not-as-described' | 'changed-mind' | 'other'

export interface ReturnRequest {
  id: string
  orderId: string
  orderNumber: string
  userId: string | null
  status: ReturnStatus
  reason: ReturnReason
  comments: string | null
  items: { orderItemId: string; title: string; quantity: number; price: number; image: string }[]
  refundAmount: number
  createdAt: string
}

export type UserRole = 'customer' | 'admin'
export type LoyaltyTier = 'thread' | 'stitch' | 'weave' | 'tapestry'

export interface PublicUser {
  id: string
  email: string
  name: string
  role: UserRole
  points: number
  tier: LoyaltyTier
  phone: string | null
  createdAt: string
}

export interface CartLine {
  /** Stable line id: `${variantId}` */
  id: string
  productId: string
  variantId: string
  handle: string
  title: string
  image: string
  price: number
  size: string | null
  color: string | null
  quantity: number
}

export interface Quote {
  lines: (CartLine & { available: number; lineTotal: number })[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  coupon: Coupon | null
  couponError: string | null
  freeShippingRemaining: number
  issues: string[]
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

/* ─────────────────────────── Settings ─────────────────────────── */

export interface StoreSettings {
  name: string
  tagline: string
  description: string
  email: string
  phone: string
  address: { street: string; city: string; state: string; zip: string; country: string }
  social: { instagram: string; pinterest: string; tiktok: string; twitter: string }
}

export interface CommerceSettings {
  currency: string
  locale: string
  freeShippingThreshold: number
  standardShippingRate: number
  expressShippingRate: number
  /** Percent, e.g. 8.875 */
  taxRate: number
  returnWindowDays: number
  pointsPerDollar: number
  codEnabled: boolean
  /**
   * Offer Razorpay at checkout. In the admin this is the owner's switch; on the storefront it is true
   * only while the switch is on AND the Razorpay keys are set on the server.
   */
  onlinePaymentsEnabled: boolean
}

export interface AnnouncementSettings {
  enabled: boolean
  messages: string[]
  link: string
}

export interface ReviewSettings {
  moderation: 'manual' | 'auto'
}

export interface HomepageSettings {
  heroEyebrow: string
  heroTitle: string
  heroSubtitle: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  manifesto: string
}

export interface SeoSettings {
  title: string
  description: string
  ogImage: string
}

export interface SiteSettings {
  store: StoreSettings
  commerce: CommerceSettings
  announcement: AnnouncementSettings
  reviews: ReviewSettings
  homepage: HomepageSettings
  seo: SeoSettings
}

export type SettingsKey = keyof SiteSettings
