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
