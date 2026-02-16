// Product types -- mirrors Shopify Storefront API for easy migration

export interface ProductImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  compareAtPrice?: number
  available: boolean
  sku: string
  color?: string
  size?: string
  image?: ProductImage
}

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml?: string
  vendor: string
  productType: string
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  price: number
  compareAtPrice?: number
  gender: GenderCategory
  category: string // e.g., 'tops', 'bottoms', 'shoes', 'accessories'
  subcategory?: string
  colors: string[]
  sizes: string[]
  featured: boolean
  new: boolean
  bestseller: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

export type GenderCategory = 'men' | 'women' | 'kids'
export type CategorySlug = 'men' | 'women' | 'kids'

export interface Category {
  slug: CategorySlug
  title: string
  description: string
  image: string
  productCount: number
}

export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  products: string[] // product handles
  featured: boolean
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
}

export interface LookbookSpread {
  id: string
  title: string
  subtitle: string
  description: string
  images: { src: string; alt: string; position: 'left' | 'right' | 'full' }[]
  products: string[] // product handles
  season: string
}

export interface SiteConfig {
  name: string
  tagline: string
  description: string
  url: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  social: {
    instagram: string
    pinterest: string
    tiktok: string
    twitter: string
  }
  brandValues: string[]
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  variantId: string
  handle: string
  title: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
}

// Filter types
export interface FilterState {
  category?: CategorySlug
  colors: string[]
  sizes: string[]
  priceRange: [number, number]
  sort: SortOption
  search: string
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'best-selling'
  | 'rating'

// UI State
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// User & Auth types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  tier: LoyaltyTier
  points: number
  createdAt: string
}

export type LoyaltyTier = 'thread' | 'stitch' | 'weave' | 'tapestry'

export interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  isDefault: boolean
}

// Order types
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered'

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: Address
  trackingNumber?: string
  placedAt: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery?: string
}

export interface OrderItem {
  productId: string
  handle: string
  title: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
}

// Loyalty types
export interface LoyaltyActivity {
  id: string
  type: 'purchase' | 'review' | 'referral' | 'birthday' | 'redemption'
  description: string
  points: number
  date: string
}

export const LOYALTY_TIERS = {
  thread: { name: 'Thread', min: 0, max: 499, discount: 5, p: 2, q: 3 },
  stitch: { name: 'Stitch', min: 500, max: 1499, discount: 8, p: 3, q: 4 },
  weave: { name: 'Weave', min: 1500, max: 2999, discount: 12, p: 3, q: 5 },
  tapestry: { name: 'Tapestry', min: 3000, max: Infinity, discount: 15, p: 3, q: 7 },
} as const

// Return types
export type ReturnStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'refunded'
export type ReturnReason = 'wrong-size' | 'defective' | 'not-as-described' | 'changed-mind' | 'other'

export interface ReturnRequest {
  id: string
  orderId: string
  orderNumber: string
  status: ReturnStatus
  reason: ReturnReason
  items: OrderItem[]
  createdAt: string
  refundAmount: number
}

// Coupon types
export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  description: string
  expiresAt: string
}

// Chat types
export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
}

// Size Guide types
export interface SizeGuideEntry {
  size: string
  chest: string
  waist: string
  hips: string
  length: string
}

// Checkout types
export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review'
